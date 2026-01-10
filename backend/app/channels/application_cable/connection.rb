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

      decoded = JwtService.decode(token)
      return reject_unauthorized_connection unless decoded

      user = User.find_by(id: decoded[:user_id])
      return reject_unauthorized_connection unless user

      user
    end

    def extract_token_from_header
      header = request.headers['Authorization']
      return nil unless header

      header.split(' ').last if header.start_with?('Bearer ')
    end

    def reject_unauthorized_connection
      reject_unauthorized_connection
    end
  end
end

