module Api
  module V1
    class TeamMembersController < ApplicationController
      before_action :set_organization
      
      def index
        @members = @organization.organization_members.includes(:user)
        render json: @members.map { |m| { id: m.id, user: m.user, role: m.role, created_at: m.created_at } }
      end
      
      def create
        user = User.find_by(email: params[:email])
        return render json: { error: "User not found" }, status: :not_found unless user
        
        member = @organization.organization_members.find_or_create_by(user: user) do |m|
          m.role = params[:role] || 'member'
        end
        
        NotificationService.create(
          user,
          "Added to Organization",
          "You have been added to '#{@organization.name}' as #{member.role}",
          notification_type: 'info',
          organization: @organization,
          action_url: "/organizations/#{@organization.id}"
        )
        
        render json: { id: member.id, user: member.user, role: member.role }, status: :created
      end
      
      def update
        member = @organization.organization_members.find(params[:id])
        member.update!(role: params[:role])
        render json: { id: member.id, user: member.user, role: member.role }
      end
      
      def destroy
        member = @organization.organization_members.find(params[:id])
        member.destroy
        head :no_content
      end
      
      private
      
      def set_organization
        @organization = Organization.find(params[:organization_id])
      end
    end
  end
end

