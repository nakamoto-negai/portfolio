class Message < ApplicationRecord
  # アソシエーション
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'
  
  # バリデーション
  validates :sender_id, presence: true
  validates :receiver_id, presence: true
  validates :content, presence: true, length: { maximum: 1000 }
  validate :sender_and_receiver_are_different
  
  # スコープ
  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }
  scope :between_users, ->(user1, user2) { 
    where(
      "(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
      user1.id, user2.id, user2.id, user1.id
    )
  }
  
  # インスタンスメソッド
  def read?
    read_at.present?
  end
  
  def unread?
    read_at.nil?
  end
  
  # メッセージを既読にする
  def mark_as_read!
    update!(read_at: Time.current) if unread?
  end
  
  # 送信者かどうかをチェック
  def sent_by?(user)
    sender == user
  end
  
  # 受信者かどうかをチェック
  def received_by?(user)
    receiver == user
  end
  
  # ユーザーに関連するメッセージかチェック
  def involves?(user)
    sender == user || receiver == user
  end
  
  # 会話の相手を取得
  def other_user(current_user)
    return receiver if sender == current_user
    return sender if receiver == current_user
    nil
  end
  
  private
  
  def sender_and_receiver_are_different
    return unless sender_id && receiver_id
    
    if sender_id == receiver_id
      errors.add(:receiver_id, "can't be the same as sender")
    end
  end
end