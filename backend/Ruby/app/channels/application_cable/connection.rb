module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    # Rack の session ハッシュを取り出すヘルパを自前で定義
    def session
      @session ||= env["rack.session"]   # ← ここがポイント
    end

    def connect
      self.current_user = User.find_by(id: session[:user_id])
      reject_unauthorized_connection unless current_user
    end
  end
end