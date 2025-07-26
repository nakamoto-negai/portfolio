# app/controllers/api/users_controller.rb
module Api
  class UsersController < ApplicationController
    before_action :authenticate_user!

    def index
      users = User.where.not(id: current_user.id)
      render json: users.select(:id, :name)
    end

    def show
      user = User.find(params[:id])
      render json: { id: user.id, name: user.name, email: user.email }
    end
  end
end
