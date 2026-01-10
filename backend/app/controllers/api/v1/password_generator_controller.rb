module Api
  module V1
    class PasswordGeneratorController < ApplicationController
      def create
        length = params[:length]&.to_i || 16
        include_uppercase = params[:include_uppercase] != "false"
        include_lowercase = params[:include_lowercase] != "false"
        include_numbers = params[:include_numbers] != "false"
        include_symbols = params[:include_symbols] != "false"

        password = generate_password(length, include_uppercase, include_lowercase, include_numbers, include_symbols)
        render json: { password: password, length: password.length }
      end

      private

      def generate_password(length, uppercase, lowercase, numbers, symbols)
        chars = []
        chars << ("A".."Z").to_a if uppercase
        chars << ("a".."z").to_a if lowercase
        chars << ("0".."9").to_a if numbers
        chars << %w[! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; : , . < > ? / ~ `] if symbols

        return "" if chars.empty?

        all_chars = chars.flatten
        password = ""
        length.times { password << all_chars.sample }
        password
      end
    end
  end
end
