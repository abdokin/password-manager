module Authenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    token = extract_token_from_header
    return render json: { error: "Unauthorized" }, status: :unauthorized unless token

    decoded = JwtService.decode(token)
    return render json: { error: "Unauthorized" }, status: :unauthorized unless decoded

    @current_user = User.find_by(id: decoded[:user_id])
    return render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user

    @current_user
  end

  def current_user
    @current_user
  end

  def extract_token_from_header
    header = request.headers['Authorization']
    return nil unless header

    header.split(' ').last if header.start_with?('Bearer ')
  end
end
