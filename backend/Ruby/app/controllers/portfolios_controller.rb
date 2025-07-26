class PortfoliosController < ApplicationController
  before_action :set_portfolio, only: [:show, :edit, :update, :destroy]
  
  # GET /portfolios
  def index
    @portfolios = Portfolio.published.recent.includes(:slides,:powerpoints)
  end
  
  # GET /portfolios/:id
  def show
    @powerpoints = @portfolio.powerpoints
  end

   
  
  # GET /portfolios/new
  def new
    @portfolio = Portfolio.new
  end


  
  # POST /portfolios
  def create
    @portfolio = Portfolio.new(portfolio_params)
    
    # PowerPointファイルを一時的に保存
    @portfolio.powerpoint_files = params[:portfolio][:powerpoint_files] if params[:portfolio][:powerpoint_files]
    
    if @portfolio.save
      redirect_to @portfolio, notice: 'ポートフォリオが正常に作成されました。'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  # GET /portfolios/:id/edit
  def edit
  end
  
  # PATCH/PUT /portfolios/:id
  def update
    if @portfolio.update(portfolio_params)
      redirect_to @portfolio, notice: 'ポートフォリオが正常に更新されました。'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  # DELETE /portfolios/:id
  def destroy
    @portfolio.destroy
    redirect_to portfolios_path, notice: 'ポートフォリオが削除されました。'
  end
  
  private
  
  def set_portfolio
    @portfolio = Portfolio.find(params[:id])
  end
  
  def portfolio_params
    params.require(:portfolio).permit(:title, :description, :is_public)
  end
end
