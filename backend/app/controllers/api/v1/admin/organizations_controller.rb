module Api
  module V1
    module Admin
      class OrganizationsController < ApplicationController
        include AdminAuthorizable
        
        def index
          @organizations = Organization.all.order(created_at: :desc)
          @organizations = @organizations.where("name LIKE ?", "%#{params[:search]}%") if params[:search].present?
          
          render json: {
            organizations: @organizations.map { |o| organization_json(o) },
            total: @organizations.count,
            active_subscriptions: Subscription.where(status: 'active').count
          }
        end
        
        def show
          @organization = Organization.find(params[:id])
          render json: organization_json(@organization, include_details: true)
        end
        
        def update
          @organization = Organization.find(params[:id])
          @organization.update!(organization_params)
          render json: organization_json(@organization)
        end
        
        def destroy
          @organization = Organization.find(params[:id])
          @organization.destroy
          head :no_content
        end
        
        private
        
        def organization_params
          params.permit(:name, :payment_provider)
        end
        
        def organization_json(organization, include_details: false)
          json = {
            id: organization.id,
            name: organization.name,
            created_at: organization.created_at,
            members_count: organization.organization_members.count,
            passwords_count: organization.passwords.count,
            environments_count: organization.environments.count,
            subscription: organization.subscription ? {
              status: organization.subscription.status,
              plan: organization.subscription.plan_name
            } : nil
          }
          
          if include_details
            json.merge!({
              members: organization.organization_members.includes(:user).map { |m|
                { id: m.id, user: { id: m.user.id, email: m.user.email }, role: m.role }
              },
              payment_provider: organization.payment_provider
            })
          end
          
          json
        end
      end
    end
  end
end


