module Api
  module V1
    class TagsController < ApplicationController
      before_action :set_tag, only: [:show, :update, :destroy]

      def index
        @tags = Tag.where(organization_id: params[:organization_id])
        render json: @tags
      end

      def show
        render json: @tag
      end

      def create
        @tag = Tag.new(tag_params)
        if @tag.save
          render json: @tag, status: :created
        else
          render json: @tag.errors, status: :unprocessable_entity
        end
      end

      def update
        if @tag.update(tag_params)
          render json: @tag
        else
          render json: @tag.errors, status: :unprocessable_entity
        end
      end

      def destroy
        @tag.destroy
        head :no_content
      end

      private

      def set_tag
        @tag = Tag.find(params[:id])
      end

      def tag_params
        params.require(:tag).permit(:name, :organization_id)
      end
    end
  end
end
