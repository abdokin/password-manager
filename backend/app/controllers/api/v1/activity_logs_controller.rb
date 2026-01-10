module Api
  module V1
    class ActivityLogsController < ApplicationController
      def index
        @logs = ActivityLog.all
        @logs = @logs.where(organization_id: params[:organization_id]) if params[:organization_id].present?
        @logs = @logs.where(user_id: params[:user_id]) if params[:user_id].present()
        @logs = @logs.recent.limit(params[:limit] || 50)
        render json: @logs
      end
    end
  end
end
