class Slide < ApplicationRecord
  # アソシエーション
  belongs_to :portfolio
  
  # ActiveStorage
  has_one_attached :image

  # バリデーション
  validates :portfolio_id, presence: true
  validates :page_number, presence: true, uniqueness: { scope: :portfolio_id }, unless: :editor_slide?
  validates :page_number, numericality: { greater_than: 0 }, unless: :editor_slide?
  
  # SlideEditor用のバリデーション
  validates :title, presence: true, if: :editor_slide?
  validates :order_index, presence: true, if: :editor_slide?
  
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
  
   # スライドショー関連のヘルパーメソッド
  def slideshow_url
    Rails.application.routes.url_helpers.portfolio_slideshow_path(portfolio)
  end

  def portfolio_url
    Rails.application.routes.url_helpers.portfolio_path(portfolio)
  end

  # 画像URL取得メソッド
  def image_url
    # ActiveStorageの画像が添付されている場合はそれを使用
    if image.attached?
      # 開発環境のデフォルトホスト設定
      host = Rails.env.development? ? 'localhost:3000' : 'production-host.com'
      
      Rails.application.routes.url_helpers.rails_blob_url(image, host: host)
    else
      # DBのimage_urlカラムがある場合はそれを使用
      read_attribute(:image_url)
    end
  end
  
  def has_image?
    image.attached?
  end

  # SlideEditorで作成されたスライドかどうか
  def editor_slide?
    slide_type == 'editor_slide'
  end

  private
  
  def set_page_number
    return if page_number.present? || editor_slide?
    
    max_page = portfolio.slides.maximum(:page_number) || 0
    self.page_number = max_page + 1
  end
end