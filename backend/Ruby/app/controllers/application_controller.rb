class ApplicationController < ActionController::Base
  private

  # 現在ログイン中のユーザーを取得
  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "User with id #{session[:user_id]} not found"
    session[:user_id] = nil
    nil
  end

  # ログインが必要なアクションで使用
  def authenticate_user!
    unless current_user
      if request.format.json?
        render json: { error: 'ログインが必要です' }, status: :unauthorized
      else
        redirect_to login_path
      end
    end
  end
end
