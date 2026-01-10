module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token] || extract_token_from_header
      return reject_unauthorized_connection unless token

      begin
        decoded = JwtService.decode(token)
        return reject_unauthorized_connection unless decoded

        user = User.find_by(id: decoded[:user_id])
        return reject_unauthorized_connection unless user

        user
      rescue => e
        Rails.logger.error "ActionCable authentication error: #{e.message}"
        reject_unauthorized_connection
      end
    end

    def extract_token_from_header
      # Try to get from query params first (WebSocket connection)
      return request.params[:token] if request.params[:token]
      
      # Try Authorization header
      header = request.headers['Authorization']
      return nil unless header

      header.split(' ').last if header.start_with?('Bearer ')
    end
  end
end
