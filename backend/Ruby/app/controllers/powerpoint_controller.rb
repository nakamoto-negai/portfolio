class PowerpointsController < ApplicationController
  before_action :set_portfolio
  before_action :set_powerpoint, only: [:show, :edit, :update, :destroy, :download]
  
  def index
    @powerpoints = @portfolio.powerpoints.recent
    @generated_powerpoints = @powerpoints.generated
    @uploaded_powerpoints = @powerpoints.uploaded
    @total_size = @powerpoints.sum(:file_size) || 0
  end
  
  def show
  end

  # GET /portfolios/new
  def new
    @portfolio = Portfolio.new
  end
  
  def new
    @powerpoint = @portfolio.powerpoints.build
  end
  
  def create
    @powerpoint = @portfolio.powerpoints.build(powerpoint_params)
    
    if @powerpoint.save
      redirect_to [@portfolio, @powerpoint], notice: 'PowerPointファイルが正常にアップロードされました。'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def edit
  end
  
  def update
    if @powerpoint.update(powerpoint_params)
      redirect_to [@portfolio, @powerpoint], notice: 'PowerPointファイルが正常に更新されました。'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    @powerpoint.purge_file!
    @powerpoint.destroy
    redirect_to portfolio_powerpoints_url(@portfolio), notice: 'PowerPointファイルが削除されました。'
  end
  
  def download
    if @powerpoint.file_exists?
      redirect_to rails_blob_path(@powerpoint.file, disposition: "attachment")
    else
      redirect_to portfolio_powerpoints_path(@portfolio), alert: 'ファイルが見つかりません。'
    end
  end
  
  private
  
  def set_portfolio
    @portfolio = Portfolio.find(params[:portfolio_id])
  end
  
  def set_powerpoint
    @powerpoint = @portfolio.powerpoints.find(params[:id])
  end
  
  def powerpoint_params
    params.require(:powerpoint).permit(:file, :description, :is_generated, :filename, :original_filename)
  end
end