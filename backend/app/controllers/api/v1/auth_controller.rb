module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!
      
      def magic_link
        email = params[:email]
        return render json: { error: "Email is required" }, status: :bad_request unless email.present?
        
        user = User.find_or_create_by(email: email) do |u|
          u.name = email.split('@').first
          u.password = SecureRandom.hex(16)
        end
        
        token = VerificationToken.create!(
          user: user,
          token: SecureRandom.hex(32),
          expires_at: 1.hour.from_now
        )
        
        render json: { message: "Verification token sent", token: token.token }
      end
      
      def verify
        token = params[:token]
        return render json: { error: "Token is required" }, status: :bad_request unless token.present?
        
        verification_token = VerificationToken.find_by(token: token)
        return render json: { error: "Invalid or expired token" }, status: :unauthorized unless verification_token
        return render json: { error: "Token expired" }, status: :unauthorized if verification_token.expires_at < Time.current
        
        user = verification_token.user
        jwt_token = JwtService.encode({ user_id: user.id, email: user.email })
        
        verification_token.destroy
        
        render json: { token: jwt_token, user: { id: user.id, email: user.email, name: user.name } }
      end
      
      def login
        email = params[:email]
        password = params[:password]
        return render json: { error: "Email and password required" }, status: :bad_request unless email.present? && password.present?
        
        user = User.find_by(email: email)
        return render json: { error: "Invalid credentials" }, status: :unauthorized unless user&.authenticate(password)
        
        jwt_token = JwtService.encode({ user_id: user.id, email: user.email })
        render json: { token: jwt_token, user: { id: user.id, email: user.email, name: user.name } }
      end
      
      def me
        render json: { user: { id: current_user.id, email: current_user.email, name: current_user.name, role: current_user.role } }
      rescue => e
        render json: { error: "Unauthorized" }, status: :unauthorized
      end
    end
  end
end
