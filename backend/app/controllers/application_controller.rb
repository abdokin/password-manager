class ApplicationController < ActionController::API
  include Authenticable
  include ApiResponse
end
