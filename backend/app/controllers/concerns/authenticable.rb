module Authenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last
    return render json: { error: 'Unauthorized' }, status: :unauthorized unless token

    decoded = JwtService.decode(token)
    return render json: { error: 'Invalid token' }, status: :unauthorized unless decoded

    @current_user = User.find_by(id: decoded[:user_id])
    return render json: { error: 'User not found' }, status: :unauthorized unless @current_user
  end

  def current_user
    @current_user
  end
end

