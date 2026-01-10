module Api
  module V1
    module Admin
      class DashboardController < ApplicationController
        include AdminAuthorizable
        
        def stats
          render json: {
            users: {
              total: User.count,
              admins: User.admins.count,
              regular: User.regular_users.count,
              new_today: User.where("created_at >= ?", Time.current.beginning_of_day).count,
              new_this_week: User.where("created_at >= ?", 7.days.ago).count
            },
            organizations: {
              total: Organization.count,
              active: Organization.joins(:subscription).where(subscriptions: { status: 'active' }).count,
              new_today: Organization.where("created_at >= ?", Time.current.beginning_of_day).count
            },
            passwords: {
              total: Password.count,
              shared: PasswordShare.count,
              favorites: Password.where(favorite: true).count
            },
            environments: {
              total: Environment.count,
              variables: EnvironmentVariable.count
            },
            feature_flags: {
              total: FeatureFlag.count,
              enabled: FeatureFlag.enabled.count,
              disabled: FeatureFlag.disabled.count
            },
            activity: {
              logs_today: ActivityLog.where("created_at >= ?", Time.current.beginning_of_day).count,
              notifications_unread: Notification.unread.count
            },
            payments: {
              total: Payment.count,
              successful: Payment.where(status: 'completed').count,
              pending: Payment.where(status: 'pending').count
            }
          }
        end
        
        def activity_logs
          @logs = ActivityLog.order(created_at: :desc).limit(100)
          @logs = @logs.where("action LIKE ?", "%#{params[:search]}%") if params[:search].present?
          @logs = @logs.where(organization_id: params[:organization_id]) if params[:organization_id].present?
          
          render json: @logs.map { |log|
            {
              id: log.id,
              action: log.action,
              details: log.details,
              organization_id: log.organization_id,
              organization_name: log.organization&.name,
              created_at: log.created_at
            }
          }
        end
      end
    end
  end
end

