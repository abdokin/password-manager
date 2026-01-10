module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:magic_link, :verify, :login]

      def magic_link
        user = User.find_or_create_by(email: params[:email])
        token = SecureRandom.hex(32)
        VerificationToken.create(user: user, token: token, expires_at: 1.hour.from_now)
        render json: { message: "Magic link sent", token: token }
      end

      def verify
        token = VerificationToken.find_by(token: params[:token])
        if token && token.expires_at > Time.current
          user = token.user
          token.destroy
          jwt_token = JwtService.encode({ user_id: user.id, email: user.email })
          render json: { 
            user: { id: user.id, email: user.email, name: user.name },
            token: jwt_token 
          }
        else
          render json: { error: "Invalid or expired token" }, status: :unauthorized
        end
      end

      def login
        user = User.find_by(email: params[:email])
        if user
          jwt_token = JwtService.encode({ user_id: user.id, email: user.email })
          render json: { 
            user: { id: user.id, email: user.email, name: user.name },
            token: jwt_token 
          }
        else
          render json: { error: "User not found" }, status: :not_found
        end
      end

      def me
        render json: { 
          user: { id: current_user.id, email: current_user.email, name: current_user.name }
        }
      end
    end
  end
end


