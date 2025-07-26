# app/channels/chat_channel.rb
class ChatChannel < ApplicationCable::Channel
  # params[:room] を JS から渡して subscribe
  def subscribed
    reject unless current_user
    stream_from params[:room]
  end
end