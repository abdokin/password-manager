class ApplicationController < ActionController::API
  include Authenticable
rescue NameError
  # Fallback if Authenticable isn't loaded yet
end
