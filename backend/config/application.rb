require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module PasswordManager
  class Application < Rails::Application
    config.load_defaults 8.1
    config.api_only = true
    config.action_controller.default_protect_from_forgery = false
  end
end

