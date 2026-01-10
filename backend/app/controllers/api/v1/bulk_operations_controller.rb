module Api
  module V1
    class BulkOperationsController < ApplicationController
      def delete
        password_ids = params[:password_ids]
        return render json: { error: "No passwords specified" }, status: :bad_request unless password_ids.present?
        
        passwords = Password.where(id: password_ids, user_id: current_user.id)
        count = passwords.count
        passwords.destroy_all
        
        render json: { deleted: count, message: "Deleted #{count} password(s)" }
      end

      def toggle_favorite
        password_ids = params[:password_ids]
        return render json: { error: "No passwords specified" }, status: :bad_request unless password_ids.present?
        
        passwords = Password.where(id: password_ids, user_id: current_user.id)
        passwords.update_all(favorite: params[:favorite] == true)
        
        render json: { updated: passwords.count, message: "Updated #{passwords.count} password(s)" }
      end

      def move_to_category
        password_ids = params[:password_ids]
        category_id = params[:category_id]
        
        return render json: { error: "No passwords specified" }, status: :bad_request unless password_ids.present?
        return render json: { error: "Category required" }, status: :bad_request unless category_id.present?
        
        passwords = Password.where(id: password_ids, user_id: current_user.id)
        passwords.update_all(category_id: category_id)
        
        render json: { updated: passwords.count, message: "Moved #{passwords.count} password(s) to category" }
      end
    end
  end
end

