module Api
  module V1
    class PasswordSharesController < ApplicationController
      def index
        @shares = PasswordShare.for_user(current_user.id)
        render json: @shares.includes(:password, :shared_by)
      end

      def create
        password = Password.find(params[:password_id])
        shared_with = User.find_by(email: params[:email])
        
        return render json: { error: "User not found" }, status: :not_found unless shared_with
        return render json: { error: "Cannot share with yourself" }, status: :unprocessable_entity if shared_with.id == current_user.id
        
        @share = PasswordShare.create!(
          password: password,
          shared_by: current_user,
          shared_with: shared_with,
          can_edit: params[:can_edit] || false
        )
        
        render json: @share, status: :created
      end

      def destroy
        @share = PasswordShare.find(params[:id])
        return render json: { error: "Unauthorized" }, status: :unauthorized unless @share.shared_by_id == current_user.id
        
        @share.destroy
        head :no_content
      end
    end
  end
end

