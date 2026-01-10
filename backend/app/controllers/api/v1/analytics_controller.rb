module Api
  module V1
    class AnalyticsController < ApplicationController
      before_action :set_organization
      
      def usage
        start_date = params[:start_date] ? Date.parse(params[:start_date]) : 30.days.ago
        end_date = params[:end_date] ? Date.parse(params[:end_date]) : Date.today
        
        passwords_created = Password.where(organization: @organization)
          .where(created_at: start_date..end_date)
          .group_by_day(:created_at)
          .count
        
        passwords_used = Password.where(organization: @organization)
          .where.not(last_used_at: nil)
          .where(last_used_at: start_date..end_date)
          .group_by_day(:last_used_at)
          .count
        
        users_active = ActivityLog.where(organization: @organization)
          .where(created_at: start_date..end_date)
          .select(:user_id)
          .distinct
          .count
        
        render json: {
          period: { start: start_date, end: end_date },
          passwords: {
            total: @organization.passwords.count,
            created: passwords_created,
            used: passwords_used
          },
          users: {
            active: users_active,
            total: @organization.users.count
          },
          environments: {
            total: @organization.environments.count,
            variables: EnvironmentVariable.joins(:environment)
              .where(environments: { organization_id: @organization.id })
              .count
          }
        }
      end
      
      private
      
      def set_organization
        @organization = Organization.find(params[:organization_id])
      end
    end
  end
end


