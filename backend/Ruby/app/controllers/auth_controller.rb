class AuthController < ApplicationController
  skip_before_action :verify_authenticity_token

  # ユーザー登録  
  def register
    user = User.new(user_params)
    if user.save
      session[:user_id] = user.id
      render json: { message: '登録成功', user: user.slice(:id, :name, :email) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # ログイン
  def login
    user = User.find_by(email: params[:email].to_s.downcase)
    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      render json: { message: 'ログイン成功', user: user.slice(:id, :name, :email) }, status: :ok
    else
      render json: { error: 'メールアドレスまたはパスワードが正しくありません' }, status: :unauthorized
    end
  end

  # ログインチェック
  def login_check
    if session[:user_id]
      user = User.find(session[:user_id])
      render json: { logged_in: true, user: user.slice(:id, :name, :email) }, status: :ok
    else
      render json: { logged_in: false }, status: :ok
    end
  end

  #ログアウト
  def logout
    reset_session
    render json: { message: 'ログアウトしました' }, status: :ok
  end

  private

  def user_params
    params.permit(:name, :email, :password)
  end
end