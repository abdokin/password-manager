module Api
  module V1
    module Admin
      class UsersController < ApplicationController
        include AdminAuthorizable
        
        def index
          @users = User.all.order(created_at: :desc)
          @users = @users.where("email LIKE ?", "%#{params[:search]}%") if params[:search].present?
          @users = @users.where(role: params[:role]) if params[:role].present?
          
          render json: {
            users: @users.map { |u| user_json(u) },
            total: @users.count,
            admins: User.admins.count,
            regular_users: User.regular_users.count
          }
        end
        
        def show
          @user = User.find(params[:id])
          render json: user_json(@user, include_details: true)
        end
        
        def update
          @user = User.find(params[:id])
          @user.update!(user_params)
          render json: user_json(@user)
        end
        
        def destroy
          @user = User.find(params[:id])
          @user.destroy
          head :no_content
        end
        
        def toggle_role
          @user = User.find(params[:id])
          new_role = @user.admin? ? 'user' : 'admin'
          @user.update!(role: new_role)
          render json: user_json(@user)
        end
        
        private
        
        def user_params
          params.permit(:name, :email, :role)
        end
        
        def user_json(user, include_details: false)
          json = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            created_at: user.created_at,
            organizations_count: user.organizations.count,
            passwords_count: user.passwords.count
          }
          
          if include_details
            json.merge!({
              organizations: user.organizations.map { |o| { id: o.id, name: o.name } },
              api_keys_count: user.api_keys.active.count,
              notifications_count: user.notifications.unread.count
            })
          end
          
          json
        end
      end
    end
  end
end

