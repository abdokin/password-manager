module Api
  module V1
    class PasswordsController < ApplicationController
      before_action :set_password, only: [:show, :update, :destroy, :toggle_favorite, :history]

      def index
        @passwords = Password.all
        
        @passwords = @passwords.where(organization_id: params[:organization_id]) if params[:organization_id].present?
        @passwords = @passwords.where(user_id: params[:user_id]) if params[:user_id].present?
        @passwords = @passwords.where(favorite: true) if params[:favorite] == 'true'
        @passwords = @passwords.where(is_breached: true) if params[:breached] == 'true'
        @passwords = @passwords.where(is_duplicate: true) if params[:duplicate] == 'true'
        @passwords = @passwords.where(is_weak: true) if params[:weak] == 'true'
        @passwords = @passwords.where("expires_at < ?", Time.current) if params[:expired] == 'true'
        
        if params[:search].present?
          search_term = "%#{params[:search]}%"
          @passwords = @passwords.where("name LIKE ? OR username LIKE ? OR url LIKE ? OR notes LIKE ?", search_term, search_term, search_term, search_term)
        end
        
        if params[:sort].present?
          direction = params[:direction] == 'desc' ? 'desc' : 'asc'
          @passwords = @passwords.order("#{params[:sort]} #{direction}")
        else
          @passwords = @passwords.order(created_at: :desc)
        end
        
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
