module Api
  class ConversationsController < ApplicationController
    before_action :authenticate_user!

    def index
      # 各会話相手との最新メッセージ時刻を取得して、新しい順にソート
      users_with_last_message = User
        .joins("INNER JOIN messages ON users.id = messages.sender_id OR users.id = messages.receiver_id")
        .where("messages.sender_id = ? OR messages.receiver_id = ?", current_user.id, current_user.id)
        .where.not(id: current_user.id)
        .select("users.id, users.name, users.email, MAX(messages.created_at) as last_message_at")
        .group("users.id, users.name, users.email")
        .order("last_message_at DESC")

      render json: users_with_last_message.map do |user|
        {
          id: user.id,
          name: user.name,
          email: user.email,
          last_message_at: user.last_message_at
        }
      end
    end
  end
end
