module Api
  module V1
    class AuthController < ApplicationController
      def magic_link
        user = User.find_or_create_by(email: params[:email])
        token = SecureRandom.hex(32)
        VerificationToken.create(user: user, token: token, expires_at: 1.hour.from_now)
        render json: { message: "Magic link sent", token: token }
      end

      def verify
        token = VerificationToken.find_by(token: params[:token])
        if token && token.expires_at > Time.current
          token.destroy
          render json: { user_id: token.user.id, email: token.user.email }
        else
          render json: { error: "Invalid or expired token" }, status: :unauthorized
        end
      end
    end
  end
end

