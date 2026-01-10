module Api
  module V1
    class NotificationsController < ApplicationController
      def index
        @notifications = Notification.where(user: current_user)
        @notifications = @notifications.where(organization_id: params[:organization_id]) if params[:organization_id].present?
        @notifications = @notifications.unread if params[:unread] == 'true'
        @notifications = @notifications.recent.limit(params[:limit] || 50)
        render json: @notifications
      end
      
      def mark_as_read
        notification = Notification.find(params[:id])
        return render json: { error: "Unauthorized" }, status: :unauthorized unless notification.user_id == current_user.id
        
        notification.mark_as_read!
        render json: { message: "Notification marked as read" }
      end
      
      def mark_all_as_read
        Notification.where(user: current_user, read_at: nil).update_all(read_at: Time.current)
        render json: { message: "All notifications marked as read" }
      end
    end
  end
end


