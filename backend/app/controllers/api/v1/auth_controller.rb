module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:login, :magic_link, :verify]
      
      def skip_authentication?
        action_name.in?(['login', 'magic_link', 'verify'])
      end
      
      def magic_link
        email = params[:email]
        return render_error(message: "Email is required", status: :bad_request) unless email.present?
        
        user = User.find_or_create_by(email: email) do |u|
          u.name = email.split('@').first
          u.password = SecureRandom.hex(16)
        end
        
        token = VerificationToken.create!(
          user: user,
          token: SecureRandom.hex(32),
          expires_at: 1.hour.from_now
        )
        
        AuthMailer.magic_link_email(user, token.token).deliver_now
        
        render_success(
          data: {
            token: token.token,
            mailhog_url: Rails.env.development? ? "http://localhost:8025" : nil
          },
          message: "Verification token sent to #{email}"
        )
      end
      
      def verify
        token = params[:token]
        return render_error(message: "Token is required", status: :bad_request) unless token.present?
        
        verification_token = VerificationToken.find_by(token: token)
        return render_unauthorized("Invalid or expired token") unless verification_token
        return render_unauthorized("Token expired") if verification_token.expires_at < Time.current
        
        user = verification_token.user
        jwt_token = JwtService.encode({ user_id: user.id, email: user.email })
        
        verification_token.destroy
        
        render_success(
          data: {
            token: jwt_token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
          },
          message: "Authentication successful"
        )
      end
      
      def login
        email = params[:email] || params.dig(:auth, :email)
        password = params[:password] || params.dig(:auth, :password)
        
        unless email.present? && password.present?
          return render_error(message: "Email and password required", status: :bad_request)
        end
        
        user = User.find_by(email: email)
        unless user
          Rails.logger.error "Login failed: User not found for email: #{email}"
          return render_error(message: "Invalid credentials", status: :unauthorized)
        end
        
        unless user.authenticate(password)
          Rails.logger.error "Login failed: Password incorrect for email: #{email}"
          return render_error(message: "Invalid credentials", status: :unauthorized)
        end
        
        jwt_token = JwtService.encode({ user_id: user.id, email: user.email })
        
        render_success(
          data: {
            token: jwt_token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
          },
          message: "Login successful"
        )
      end
      
      def me
        render_success(
          data: {
            user: { id: current_user.id, email: current_user.email, name: current_user.name, role: current_user.role }
          }
        )
      rescue => e
        render_unauthorized("Unauthorized")
      end
    end
  end
end
