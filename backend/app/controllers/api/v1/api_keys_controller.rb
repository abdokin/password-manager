module Api
  module V1
    class ApiKeysController < ApplicationController
      def index
        @api_keys = ApiKey.where(user: current_user, organization_id: params[:organization_id])
        render json: @api_keys.active
      end
      
      def create
        @api_key = ApiKey.create!(
          user: current_user,
          organization_id: params[:organization_id],
          name: params[:name],
          expires_at: params[:expires_at] ? Time.parse(params[:expires_at]) : nil
        )
        render json: @api_key, status: :created
      end
      
      def revoke
        @api_key = ApiKey.find_by(key: params[:key], user: current_user)
        return render json: { error: "Not found" }, status: :not_found unless @api_key
        
        @api_key.revoke!
        render json: { message: "API key revoked" }
      end
    end
  end
end

