module Api
  module V1
    class EnvironmentsController < ApplicationController
      before_action :set_environment, only: [:show, :update, :destroy, :variables, :accesses, :grant_access, :revoke_access]
      
      def index
        @environments = Environment.for_organization(params[:organization_id])
        @environments = @environments.by_type(params[:type]) if params[:type].present?
        render json: @environments.includes(:environment_variables, :environment_accesses)
      end
      
      def show
        render json: @environment, include: [:environment_variables, :environment_accesses]
      end
      
      def create
        @environment = Environment.new(environment_params)
        if @environment.save
          @environment.grant_access(current_user, role: 'admin')
          render json: @environment, status: :created
        else
          render json: @environment.errors, status: :unprocessable_entity
        end
      end
      
      def update
        if @environment.update(environment_params)
          render json: @environment
        else
          render json: @environment.errors, status: :unprocessable_entity
        end
      end
      
      def destroy
        @environment.destroy
        head :no_content
      end
      
      def variables
        variables = @environment.environment_variables
        render json: variables.map { |v| { id: v.id, key: v.key, value: v.mask_value, encrypted: v.encrypted, description: v.description } }
      end
      
      def add_variable
        @environment = Environment.find(params[:environment_id])
        return render json: { error: "Unauthorized" }, status: :unauthorized unless @environment.can_edit?(current_user)
        
        variable = @environment.add_variable(
          params[:key],
          params[:value],
          encrypted: params[:encrypted] == true
        )
        render json: { id: variable.id, key: variable.key, value: variable.mask_value, encrypted: variable.encrypted }, status: :created
      end
      
      def get_variable
        @environment = Environment.find(params[:environment_id])
        return render json: { error: "Unauthorized" }, status: :unauthorized unless @environment.has_access?(current_user)
        
        value = @environment.get_variable(params[:key])
        if value
          render json: { key: params[:key], value: value }
        else
          render json: { error: "Variable not found" }, status: :not_found
        end
      end
      
      def update_variable
        @environment = Environment.find(params[:environment_id])
        return render json: { error: "Unauthorized" }, status: :unauthorized unless @environment.can_edit?(current_user)
        
        variable = @environment.environment_variables.find_by(key: params[:key])
        if variable
          variable.update(value: params[:value], encrypted: params[:encrypted] == true)
          render json: { id: variable.id, key: variable.key, value: variable.mask_value, encrypted: variable.encrypted }
        else
          render json: { error: "Variable not found" }, status: :not_found
        end
      end
      
      def delete_variable
        @environment = Environment.find(params[:environment_id])
        return render json: { error: "Unauthorized" }, status: :unauthorized unless @environment.can_edit?(current_user)
        
        variable = @environment.environment_variables.find_by(key: params[:key])
        if variable
          variable.destroy
          head :no_content
        else
          render json: { error: "Variable not found" }, status: :not_found
        end
      end
      
      def accesses
        render json: @environment.environment_accesses.includes(:user)
      end
      
      def grant_access
        user = User.find_by(email: params[:email])
        return render json: { error: "User not found" }, status: :not_found unless user
        
        access = @environment.grant_access(user, role: params[:role] || 'viewer')
        render json: access, include: :user, status: :created
      end
      
      def revoke_access
        user = User.find_by(email: params[:email])
        return render json: { error: "User not found" }, status: :not_found unless user
        
        @environment.revoke_access(user)
        head :no_content
      end
      
      private
      
      def set_environment
        @environment = Environment.find(params[:id])
      end
      
      def environment_params
        params.require(:environment).permit(:name, :environment_type, :description, :organization_id)
      end
    end
  end
end

