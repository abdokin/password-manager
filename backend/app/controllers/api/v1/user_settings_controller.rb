module Api
  module V1
    class UserSettingsController < ApplicationController
      def index
        settings = UserSetting.where(user: current_user).pluck(:key, :value).to_h
        render json: settings
      end

      def show
        value = UserSetting.get(current_user, params[:key])
        render json: { key: params[:key], value: value }
      end

      def create
        UserSetting.set(current_user, params[:key], params[:value])
        render json: { key: params[:key], value: params[:value] }, status: :created
      end

      def update
        UserSetting.set(current_user, params[:key], params[:value])
        render json: { key: params[:key], value: params[:value] }
      end
    end
  end
end

