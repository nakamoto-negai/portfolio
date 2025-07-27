class Slide < ApplicationRecord
  # アソシエーション
  belongs_to :portfolio
  
  # ActiveStorage
  has_one_attached :image

  # バリデーション
  validates :portfolio_id, presence: true
  validates :page_number, presence: true, uniqueness: { scope: :portfolio_id }
  validates :page_number, numericality: { greater_than: 0 }
  
  # コールバック
  before_validation :set_page_number, on: :create

  # スコープ
  scope :ordered, -> { order(:page_number) }
  
  # インスタンスメソッド
  def next_slide
    portfolio.slides.where('page_number > ?', page_number).order(:page_number).first
  end
  
  def previous_slide
    portfolio.slides.where('page_number < ?', page_number).order(page_number: :desc).first
  end
  
  def first_slide?
    page_number == 1
  end
  
  def last_slide?
    page_number == portfolio.slides.maximum(:page_number)
  end

  def image_url
    begin
      return nil unless image.attached?
      Rails.application.routes.url_helpers.rails_blob_path(image, only_path: true)
    rescue => e
      Rails.logger.error "Error getting slide image URL: #{e.message}"
      return nil
    end
  end
  
   # スライドショー関連のヘルパーメソッド
  def slideshow_url
    Rails.application.routes.url_helpers.portfolio_slideshow_path(portfolio)
  end

  def portfolio_url
    Rails.application.routes.url_helpers.portfolio_path(portfolio)
  end

  private
  
  def set_page_number
    return if page_number.present?
    
    max_page = portfolio.slides.maximum(:page_number) || 0
    self.page_number = max_page + 1
  end
end