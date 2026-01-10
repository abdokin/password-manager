module Api
  module V1
    class OrganizationsController < ApplicationController
      def index
        @organizations = Organization.all
        render json: @organizations
      end

      def show
        @organization = Organization.find(params[:id])
        render json: @organization
      end

      def create
        @organization = Organization.new(organization_params)
        if @organization.save
          OrganizationMember.create!(organization: @organization, user: current_user, role: 'owner')
          NotificationService.create(
            current_user,
            "Organization Created",
            "Organization '#{@organization.name}' has been created",
            notification_type: 'success',
            organization: @organization
          )
          render json: @organization, status: :created
        else
          render json: @organization.errors, status: :unprocessable_entity
        end
      end

      def update
        @organization = Organization.find(params[:id])
        if @organization.update(organization_params)
          render json: @organization
        else
          render json: @organization.errors, status: :unprocessable_entity
        end
      end

      def destroy
        @organization = Organization.find(params[:id])
        @organization.destroy
        head :no_content
      end

      private

      def organization_params
        params.require(:organization).permit(:name)
      end
    end
  end
end
