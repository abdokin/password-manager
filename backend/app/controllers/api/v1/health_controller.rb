module Api
  module V1
    class HealthController < ApplicationController
      skip_before_action :authenticate_user!
      
      def show
        render json: { status: "ok", timestamp: Time.current }
      end
    end
  end
end
