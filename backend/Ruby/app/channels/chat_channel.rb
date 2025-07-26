# app/channels/chat_channel.rb
class ChatChannel < ApplicationCable::Channel
  def subscribed
    reject unless current_user

    # クライアントが identifier に { room: "room_1_2" } を渡している想定
    room = params[:room]
    reject unless room.present?

    stream_from room
  end
end