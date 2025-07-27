module Api
  class Api::UsersController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :set_user, only: [:show, :update]

    def index
      if current_user
        users = User.where.not(id: current_user.id)
      else
        users = User.all
      end
      render json: users.select(:id, :name)
    end

    # GET /api/users/:id
    def show
      user = User.find(params[:id])
      render json: @user.slice(:id, :name, :email, :profile, :skill, :experience, :github_url, :twitter_url)
    end

    # PATCH/PUT /api/users/:id
    def update
      # デバッグ用ログ追加
      Rails.logger.info "Update request - User ID: #{@user.id}, Session User ID: #{session[:user_id]}"
      Rails.logger.info "User params: #{user_params}"
      
      # ログインしているユーザー本人のみ更新可能にする (簡易的な認可)
      if @user.id.to_i == session[:user_id].to_i
        if @user.update(user_params)
          render json: @user.slice(:id, :name, :email, :profile, :skill, :experience, :github_url, :twitter_url)
        else
          Rails.logger.error "Update failed with errors: #{@user.errors.full_messages}"
          render json: { error: 'バリデーションエラー', errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        Rails.logger.error "Authorization failed - User ID mismatch"
        render json: { error: '権限がありません' }, status: :forbidden
      end
    end

    private

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:name, :email, :profile, :skill, :experience, :github_url, :twitter_url)
    end
  end
end