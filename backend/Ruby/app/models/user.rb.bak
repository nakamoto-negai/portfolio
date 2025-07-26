class User < ApplicationRecord
  # セキュアなパスワード管理
  has_secure_password
  
  # アソシエーション
  has_many :portfolios, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :liked_portfolios, through: :likes, source: :portfolio
  
  # メッセージ関連のアソシエーション
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id', dependent: :destroy
  has_many :received_messages, class_name: 'Message', foreign_key: 'receiver_id', dependent: :destroy
  
  # バリデーション
  validates :name, presence: true, length: { maximum: 50 }
  validates :email, presence: true,
                    uniqueness: { case_sensitive: false }, 
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, allow_nil: true
  validates :profile, length: { maximum: 500 }
  
  # コールバック
  before_save { self.email = email.downcase }
  
  # インスタンスメソッド
  def full_name
    name
  end
  
  # 指定したポートフォリオにいいねしているかチェック
  def liked?(portfolio)
    likes.exists?(portfolio: portfolio)
  end
  
  # ポートフォリオにいいねを付ける
  def like(portfolio)
    likes.find_or_create_by(portfolio: portfolio)
  end
  
  # ポートフォリオのいいねを外す
  def unlike(portfolio)
    likes.find_by(portfolio: portfolio)&.destroy
  end
  
  # 未読メッセージ数を取得
  def unread_messages_count
    received_messages.where(read_at: nil).count
  end
end