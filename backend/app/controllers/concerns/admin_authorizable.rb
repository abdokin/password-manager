module AdminAuthorizable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
    before_action :ensure_admin!
  end

  private

  def ensure_admin!
    unless current_user&.admin?
      render json: { error: "Forbidden: Admin access required" }, status: :forbidden
    end
  end
end


