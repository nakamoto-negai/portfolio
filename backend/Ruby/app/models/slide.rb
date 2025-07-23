class Slide < ApplicationRecord
  # アソシエーション
  belongs_to :portfolio
  
  # バリデーション
  validates :portfolio_id, presence: true
  validates :image_url, presence: true, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }
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
  
  private
  
  def set_page_number
    return if page_number.present?
    
    max_page = portfolio.slides.maximum(:page_number) || 0
    self.page_number = max_page + 1
  end
end