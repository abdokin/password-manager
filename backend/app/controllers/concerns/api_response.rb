module ApiResponse
  extend ActiveSupport::Concern

  def render_success(data: nil, message: nil, status: :ok)
    response = {
      success: true,
      timestamp: Time.current.iso8601,
      data: data,
      message: message
    }
    render json: response, status: status
  end

  def render_error(message: nil, errors: nil, status: :unprocessable_entity)
    response = {
      success: false,
      timestamp: Time.current.iso8601,
      error: message,
      errors: errors
    }
    render json: response, status: status
  end

  def render_unauthorized(message: "Unauthorized")
    render_error(message: message, status: :unauthorized)
  end

  def render_not_found(message: "Resource not found")
    render_error(message: message, status: :not_found)
  end

  def render_forbidden(message: "Forbidden")
    render_error(message: message, status: :forbidden)
  end
end
