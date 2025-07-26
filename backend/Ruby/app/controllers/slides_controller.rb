class SlidesController < ApplicationController
  before_action :set_portfolio, only: [:index, :show, :new, :create]
  before_action :set_slide, only: [:show, :edit, :update, :destroy]
  
  # GET /portfolios/:portfolio_id/slides
  def index
    @slides = @portfolio.slides.ordered
  end
  
  # GET /portfolios/:portfolio_id/slides/:id
  def show
    @previous_slide = @slide.previous_slide
    @next_slide = @slide.next_slide
  end
  
  # GET /portfolios/:portfolio_id/slides/new
  def new
    @slide = @portfolio.slides.build
  end
  
  # POST /portfolios/:portfolio_id/slides
  def create
    @slide = @portfolio.slides.build(slide_params)
    
    if @slide.save
      redirect_to portfolio_slide_path(@portfolio, @slide), notice: 'スライドが正常に作成されました。'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  # GET /slides/:id/edit
  def edit
  end
  
  # PATCH/PUT /slides/:id
  def update
    if @slide.update(slide_params)
      redirect_to portfolio_slide_path(@slide.portfolio, @slide), notice: 'スライドが正常に更新されました。'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  # DELETE /slides/:id
  def destroy
    portfolio = @slide.portfolio
    @slide.destroy
    redirect_to portfolio_slides_path(portfolio), notice: 'スライドが削除されました。'
  end
  
  # API用：スライドショー表示
  def slideshow
    @portfolio = Portfolio.find(params[:portfolio_id])
    @slides = @portfolio.slides.ordered
    render layout: 'slideshow'
  end
  
  private
  
  def set_portfolio
    @portfolio = Portfolio.find(params[:portfolio_id])
  end
  
  def set_slide
    @slide = Slide.find(params[:id])
  end
  
  def slide_params
    params.require(:slide).permit(:image, :page_number)
  end
end
