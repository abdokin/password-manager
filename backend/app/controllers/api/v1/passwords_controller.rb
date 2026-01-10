module Api
  module V1
    class PasswordsController < ApplicationController
      before_action :set_password, only: [:show, :update, :destroy, :toggle_favorite, :history]

      def index
        @passwords = Password.all
        render json: @passwords
      end

      def show
        render json: @password
      end

      def create
        @password = Password.new(password_params)
        if @password.save
          render json: @password, status: :created
        else
          render json: @password.errors, status: :unprocessable_entity
        end
      end

      def update
        if @password.update(password_params)
          render json: @password
        else
          render json: @password.errors, status: :unprocessable_entity
        end
      end

      def destroy
        @password.destroy
        head :no_content
      end

      def toggle_favorite
        @password.toggle_favorite!
        render json: @password
      end

      def history
        render json: @password.password_history
      end

      private

      def set_password
        @password = Password.find(params[:id])
      end

      def password_params
        params.require(:password).permit(:name, :username, :password, :url, :notes, :favorite, :expires_at, :user_id, :organization_id, :category_id)
      end
    end
  end
end
