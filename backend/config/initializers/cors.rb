Rails.application.config.after_initialize do
  if defined?(EnvConfig) && EnvConfig.cors_enabled?
    Rails.application.config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins EnvConfig.allowed_origins
        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          credentials: true
      end
    end
  else
    Rails.application.config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options, :head]
      end
    end
  end
end
