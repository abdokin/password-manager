module Api
  module V1
    class FeatureFlagsController < ApplicationController
      before_action :authenticate_user!
      
      def index
        @flags = FeatureFlagService.enabled_flags(
          user: current_user,
          organization: current_organization
        )
        render json: @flags
      end
      
      def show
        @flag = FeatureFlag.find_by(key: params[:id])
        return render json: { error: "Not found" }, status: :not_found unless @flag
        
        render json: {
          key: @flag.key,
          name: @flag.name,
          description: @flag.description,
          status: @flag.status,
          category: @flag.category,
          enabled: @flag.enabled_for?(
            user: current_user,
            organization: current_organization
          ),
          metadata: @flag.metadata
        }
      end
      
      def create
        @flag = FeatureFlagService.create_flag(
          params[:key],
          params[:name],
          description: params[:description],
          category: params[:category],
          status: params[:status] || 'disabled',
          metadata: params[:metadata] || {}
        )
        render json: @flag, status: :created
      end
      
      def update
        @flag = FeatureFlag.find_by(key: params[:id])
        return render json: { error: "Not found" }, status: :not_found unless @flag
        
        @flag.update!(
          name: params[:name] || @flag.name,
          description: params[:description] || @flag.description,
          status: params[:status] || @flag.status,
          category: params[:category] || @flag.category,
          metadata: params[:metadata] || @flag.metadata
        )
        render json: @flag
      end
      
      def toggle
        @flag = FeatureFlagService.toggle_flag(
          params[:id],
          params[:status]
        )
        return render json: { error: "Not found" }, status: :not_found unless @flag
        
        render json: @flag
      end
      
      def set_override
        @override = FeatureFlagService.set_override(
          params[:id],
          user: params[:user_id] ? User.find(params[:user_id]) : nil,
          organization: params[:organization_id] ? Organization.find(params[:organization_id]) : nil,
          enabled: params[:enabled] != false
        )
        return render json: { error: "Not found" }, status: :not_found unless @override
        
        render json: { message: "Override set successfully" }
      end
      
      def remove_override
        FeatureFlagService.remove_override(
          params[:id],
          user: params[:user_id] ? User.find(params[:user_id]) : nil,
          organization: params[:organization_id] ? Organization.find(params[:organization_id]) : nil
        )
        render json: { message: "Override removed successfully" }
      end
      
      private
      
      def current_organization
        return nil unless params[:organization_id]
        Organization.find(params[:organization_id])
      end
    end
  end
end


