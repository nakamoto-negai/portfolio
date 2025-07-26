module Api
  class ApplicationController < ActionController::Base
    protect_from_forgery with: :exception

    helper_method :current_user

    private

    # 現在ログイン中のユーザーを取得
    def current_user
      @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
    end

    # 未ログインならリダイレクト or エラー返す
    def authenticate_user!
      unless current_user
        respond_to do |format|
          format.html { redirect_to '/login', alert: 'ログインしてください' }
          format.json { render json: { error: 'ログインが必要です' }, status: :unauthorized }
          format.turbo_stream { head :unauthorized }
        end
      end
    end
  end
end