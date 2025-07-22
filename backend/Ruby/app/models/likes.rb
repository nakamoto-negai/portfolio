class Like < ApplicationRecord
  # アソシエーション
  belongs_to :user
  belongs_to :portfolio
  
  # バリデーション
  validates :user_id, presence: true
  validates :portfolio_id, presence: true
  validates :user_id, uniqueness: { scope: :portfolio_id, message: "already liked this portfolio" }
  
  # コールバック
  after_create :increment_portfolio_likes_counter
  after_destroy :decrement_portfolio_likes_counter
  
  # スコープ
  scope :recent, -> { order(created_at: :desc) }
  
  private
  
  def increment_portfolio_likes_counter
    # キャッシュ用のカウンターがある場合の処理
    # portfolio.increment!(:likes_count) if portfolio.respond_to?(:likes_count)
  end
  
  def decrement_portfolio_likes_counter
    # キャッシュ用のカウンターがある場合の処理
    # portfolio.decrement!(:likes_count) if portfolio.respond_to?(:likes_count)
  end
end