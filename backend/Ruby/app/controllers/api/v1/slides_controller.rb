class Api::V1::SlidesController < ApplicationController
  before_action :set_portfolio
  before_action :set_slide, only: [:update, :destroy]
  skip_before_action :verify_authenticity_token

  # GET /api/v1/portfolios/:portfolio_id/slides
  #スライドのナンバー順に取得
  def index
    @slides = @portfolio.slides.order(:page_number)
    render json: @slides
  end

  # POST /api/v1/portfolios/:portfolio_id/slides
  def create
    @slide = @portfolio.slides.build(slide_params)
    if @slide.save
      render json: @slide, status: :created
    else
      render json: @slide.errors, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/portfolios/:portfolio_id/slides/:id
  def update
    if @slide.update(slide_params)
      render json: @slide
    else
      render json: @slide.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/portfolios/:portfolio_id/slides/:id
  def destroy
    if @slide.destroy
      render json: { message: 'Slide deleted successfully' }, status: :ok
    else
      render json: { error: 'Failed to delete slide' }, status: :unprocessable_entity
    end
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