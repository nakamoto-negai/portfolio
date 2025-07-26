# app/controllers/api/messages_controller.rb
module Api
  class MessagesController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :authenticate_user!            # ★既存の Cookie-Auth を使う
    before_action :set_other_user

    # GET /api/conversations/:conversation_id/messages
    def index
      messages = Message.between_users(current_user, @other_user)
                         .recent
                         .limit(100)             # ページングはお好みで
      render json: messages, each_serializer: MessageSerializer
    end

    # POST /api/conversations/:conversation_id/messages
    def create
      message = current_user.sent_messages.build(
        receiver: @other_user,
        content:  params.require(:content)
      )

      if message.save
        # WebSocket へ JSON をブロードキャスト
        room_id = room_name(current_user.id, @other_user.id)
        ActionCable.server.broadcast(room_id,
          MessageSerializer.new(message).as_json
        )
        head :created
      else
        render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def set_other_user
      @other_user = User.find(params[:conversation_id])
    end

    def room_name(a, b)
      "room_#{[a, b].sort.join('_')}"            # 例）room_3_42
    end
  end
end