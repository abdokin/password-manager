require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module PasswordManager
  class Application < Rails::Application
    config.load_defaults 8.1
    config.api_only = true
    config.action_controller.default_protect_from_forgery = false
    
    config.after_initialize do
      if defined?(Rack::Attack) && defined?(EnvConfig) && EnvConfig.rate_limit_enabled?
        config.middleware.use Rack::Attack
      end
      if defined?(EnvConfig)
        config.log_level = EnvConfig.log_level
      end
    end
  end
end
