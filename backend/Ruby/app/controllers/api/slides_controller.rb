module Api
  class Api::V1::SlidesController < ApplicationController
    before_action :set_portfolio
    before_action :set_slide, only: [:update, :destroy]
    skip_before_action :verify_authenticity_token

    # GET /api/v1/portfolios/:portfolio_id/slides
    # スライド一覧取得
    def index
      @slides = @portfolio.slides.order(:page_number)
      render json: @slides
    end

    # POST /api/v1/portfolios/:portfolio_id/slides
    # スライド作成
    def create
      @slide = @portfolio.slides.build(slide_params)
      if @slide.save
        render json: @slide, status: :created
      else
        render json: @slide.errors, status: :unprocessable_entity
      end
    end

    # PATCH /api/v1/portfolios/:portfolio_id/slides/:id
    # スライド更新
    def update
      if @slide.update(slide_params)
        render json: @slide
      else
        render json: @slide.errors, status: :unprocessable_entity
      end
    end

    # DELETE /api/v1/portfolios/:portfolio_id/slides/:id
    # スライド削除
    def destroy
      if @slide.destroy
        render json: { message: 'Slide deleted successfully' }, status: :ok
      else
        render json: { error: 'Failed to delete slide' }, status: :unprocessable_entity
      end
    end

    # GET /api/v1/portfolios/:portfolio_id/slides/thumbnail
    # サムネイル取得
    def thumbnail
      @slide = @portfolio.slides.order(:page_number).first
      if @slide
        render json: @slide.as_json(only: [:id, :image_url, :page_number])
      else
        render json: { error: 'No slides found' }, status: :not_found
      end
    end

    # POST /api/v1/portfolios/:portfolio_id/slides/bulk_create
    # スライド一括作成
    def bulk_create
      slides_data = params[:slides] || []
      created_slides = []
      
      slides_data.each_with_index do |slide_params, index|
        slide = @portfolio.slides.create(
          image_url: slide_params[:image_url],
          page_number: slide_params[:page_number] || (index + 1)
        )
        created_slides << slide if slide.persisted?
      end
      
      render json: { slides: created_slides }, status: :created
    end

    # PUT /api/v1/portfolios/:portfolio_id/slides/reorder
    # スライド順序変更
    def reorder
      slide_ids = params[:slide_ids] || []
      
      slide_ids.each_with_index do |slide_id, index|
        @portfolio.slides.find(slide_id).update(page_number: index + 1)
      end
      
      render json: { message: '順序を更新しました' }
    end

    private

    def set_portfolio
      @portfolio = Portfolio.find(params[:portfolio_id])
    end

    def set_slide
      @slide = @portfolio.slides.find(params[:id])
    end

    def slide_params
      params.require(:slide).permit(:image_url, :page_number)
    end
  end
end