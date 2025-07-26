module Api
  class ConversationsController < ApplicationController
    before_action :authenticate_user!

    def index
      users = User
        .joins("INNER JOIN messages ON users.id = messages.sender_id OR users.id = messages.receiver_id")
        .where("messages.sender_id = ? OR messages.receiver_id = ?", current_user.id, current_user.id)
        .where.not(id: current_user.id)
        .distinct

      render json: users.select(:id, :name, :email)
    end
  end
end
