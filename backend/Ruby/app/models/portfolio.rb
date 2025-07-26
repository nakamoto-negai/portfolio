class Portfolio < ApplicationRecord
  # アソシエーション
  belongs_to :user
  has_many :slides, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :liked_users, through: :likes, source: :user
  
  # バリデーション
  validates :title, presence: true, length: { maximum: 100 }
  validates :description, presence: true, length: { maximum: 1000 }
  validates :is_public, inclusion: { in: [true, false] }
  validates :user_id, presence: true
  
  # スコープ
  scope :published, -> { where(is_public: true) }
  scope :recent, -> { order(created_at: :desc) }
  scope :popular, -> { joins(:likes).group(:id).order('COUNT(likes.id) DESC') }
  
  # インスタンスメソッド
  def published?
    is_public
  end
  
  def likes_count
    likes.count
  end
  
  def slides_count
    slides.count
  end
  
  # 公開/非公開を切り替える
  def toggle_publication!
    update!(is_public: !is_public)
  end
  
  # スライドを順番に並べて取得
  def ordered_slides
    slides.order(:page_number)
  end
  
  # 最初のスライドを取得（サムネイル用）
  def thumbnail_slide
    slides.where.not(page_number: nil).order(:page_number).first
  end
end