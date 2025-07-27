module Api
  class Api::PortfoliosController < ApplicationController
  skip_before_action :verify_authenticity_token 
    before_action :set_portfolio, only: [:show, :update, :destroy]

    # GET /api/v1/portfolios
    # 全ポートフォリオ取得
    def index
      @portfolios = Portfolio.all
      render json: @portfolios
    end

    # GET /api/v1/portfolios/published
    # 公開ポートフォリオ一覧取得（自分以外のユーザーの作品のみ）
    def published
      if current_user
        # ログイン中の場合は自分以外のポートフォリオを表示
        @portfolios = Portfolio.published.includes(:user, :slides, :powerpoints).where.not(user: current_user).recent
      else
        # 未ログインの場合は全ての公開ポートフォリオを表示
        @portfolios = Portfolio.published.includes(:user, :slides, :powerpoints).recent
      end
      
      render json: @portfolios.as_json(
        only: [:id, :title, :description, :is_public, :created_at, :updated_at, :user_id],
        include: { user: { only: [:id, :name] } },
        methods: [
          :slides_count, 
          :powerpoints_count, 
          :total_powerpoint_size, 
          :latest_powerpoint_filename,
          :likes_count,
          :has_main_image?,
          :main_image_url
        ],
        include: { user: { only: [:id, :name] } }
      )
    end

    # GET /api/v1/portfolios/my
    # 自分のポートフォリオ一覧取得
    def my
      unless current_user
        render json: { error: 'ログインが必要です' }, status: :unauthorized
        return
      end
      
      @portfolios = current_user.portfolios.includes(:slides, :powerpoints).recent
      render json: @portfolios.as_json(
        only: [:id, :title, :description, :is_public, :created_at, :updated_at],
        methods: [
          :slides_count, 
          :powerpoints_count, 
          :total_powerpoint_size, 
          :latest_powerpoint_filename,
          :likes_count,
          :has_main_image?,
          :main_image_url
        ]
      )
    end

    # GET /api/v1/portfolios/:id
    # ポートフォリオ詳細取得
    def show
      render json: @portfolio.as_json(
        only: [:id, :title, :description, :is_public, :created_at, :updated_at],
        include: { user: { only: [:id, :name] } }
      )
    end

    # POST /api/v1/portfolios
    def create
      unless current_user
        render json: { error: 'ログインが必要です' }, status: :unauthorized
        return
      end
      
      @portfolio = Portfolio.new(portfolio_params)
      @portfolio.user = current_user
      
      # PowerPointファイルを一時的に保存
      @portfolio.powerpoint_files = params[:portfolio][:powerpoint_files] if params[:portfolio][:powerpoint_files]
      
      if @portfolio.save
        if params[:portfolio][:powerpoint_files]
          # 既存のスライドをクリア（重複を避けるため）
          @portfolio.slides.destroy_all
          Rails.logger.info "Cleared existing slides for portfolio #{@portfolio.id}"
          
          # 1つ目のファイルをPowerPointモデルとして保存
          powerpoint = @portfolio.powerpoints.create(file: params[:portfolio][:powerpoint_files].first)
          Rails.logger.info "Created powerpoint record with ID: #{powerpoint.id}"
          
          # メイン画像とすべてのスライドを抽出
          main_result = PowerpointImageExtractorService.new(@portfolio, powerpoint).extract_main_image
          Rails.logger.info "Main image extraction result: #{main_result}"
          
          slides_result = PowerpointImageExtractorService.new(@portfolio, powerpoint).extract_all_slide_images
          Rails.logger.info "All slides extraction result: #{slides_result}"
        end
        render json: @portfolio, status: :created
      else
        render json: @portfolio.errors, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /api/v1/portfolios/:id
    def update
      if @portfolio.update(portfolio_params)
        render json: @portfolio
      else
        render json: @portfolio.errors, status: :unprocessable_entity
      end
    end

    # DELETE /api/v1/portfolios/:id
    def destroy
      @portfolio.destroy
      render json: { message: 'Portfolio deleted successfully' }, status: :ok
    end

    # POST /api/portfolios/from_slides
    # SlideEditorからのポートフォリオ作成
    def from_slides
      unless current_user
        render json: { error: 'ログインが必要です' }, status: :unauthorized
        return
      end
      
      begin
        @portfolio = Portfolio.new(slides_portfolio_params)
        @portfolio.user = current_user
        
        if @portfolio.save
          # SlideEditorのデータをSlidesとして保存
          if params[:portfolio][:slides_data] && params[:portfolio][:slides_data][:slides]
            create_slides_from_editor_data(@portfolio, params[:portfolio][:slides_data][:slides])
          end
          
          render json: {
            portfolio: @portfolio.as_json(
              only: [:id, :title, :description, :is_public, :created_at, :updated_at],
              include: { user: { only: [:id, :name] } },
              methods: [:slides_count]
            ),
            message: 'Portfolio created successfully from SlideEditor'
          }, status: :created
        else
          render json: @portfolio.errors, status: :unprocessable_entity
        end
      rescue => e
        Rails.logger.error "Error creating portfolio from slides: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        render json: { error: 'ポートフォリオの作成中にエラーが発生しました' }, status: :internal_server_error
      end
    end

    private

    # ポートフォリオ取得
    def set_portfolio
      @portfolio = Portfolio.includes(:user).find(params[:id])
    end

    # Strong Parameters
    def portfolio_params
      params.require(:portfolio).permit(:title, :description, :user_id, :is_public)
    end

    # SlideEditor用のStrong Parameters
    def slides_portfolio_params
      params.require(:portfolio).permit(:title, :description, :is_public)
    end

    # SlideEditorのデータからSlidesを作成
    def create_slides_from_editor_data(portfolio, slides_data)
      slides_data.each_with_index do |slide_data, index|
        slide = portfolio.slides.build(
          title: slide_data[:title] || "スライド #{index + 1}",
          content: slide_data.to_json, # 全データをJSONとして保存
          order_index: index,
          slide_type: 'editor_slide',
          page_number: nil # editor_slideの場合はpage_numberを使わない
        )
        
        # 背景色があれば保存
        if slide_data[:background]
          slide.background_color = slide_data[:background]
        end
        
        # エラーハンドリング付きで保存
        unless slide.save
          Rails.logger.error "Failed to save slide #{index}: #{slide.errors.full_messages}"
          raise "スライド #{index + 1} の保存に失敗しました: #{slide.errors.full_messages.join(', ')}"
        end
        
        Rails.logger.info "Created slide #{index + 1} for portfolio #{portfolio.id}"
      end
      
      Rails.logger.info "Successfully created #{slides_data.length} slides for portfolio #{portfolio.id}"
    end
  end
end