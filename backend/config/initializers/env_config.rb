module EnvConfig
  def self.jwt_secret_key
    ENV['JWT_SECRET_KEY'] || Rails.application.credentials.secret_key_base || 'development_secret_key'
  end

  def self.jwt_expiration_hours
    ENV.fetch('JWT_EXPIRATION_HOURS', 24).to_i
  end

  def self.allowed_origins
    ENV.fetch('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
  end

  def self.cors_enabled?
    ENV.fetch('ENABLE_CORS', 'true') == 'true'
  end

  def self.rate_limit_enabled?
    ENV.fetch('RATE_LIMIT_ENABLED', 'true') == 'true'
  end

  def self.rate_limit_requests_per_minute
    ENV.fetch('RATE_LIMIT_REQUESTS_PER_MINUTE', '100').to_i
  end

  def self.log_level
    ENV.fetch('LOG_LEVEL', 'info').to_sym
  end

  def self.redis_url
    ENV.fetch('REDIS_URL', 'redis://localhost:6379/0')
  end

  def self.smtp_config
    {
      host: ENV.fetch('SMTP_HOST', 'smtp.gmail.com'),
      port: ENV.fetch('SMTP_PORT', '587').to_i,
      username: ENV['SMTP_USERNAME'],
      password: ENV['SMTP_PASSWORD'],
      from: ENV.fetch('SMTP_FROM_EMAIL', 'noreply@passwordmanager.com')
    }
  end

  def self.feature_enabled?(feature)
    case feature
    when :password_sharing
      ENV.fetch('ENABLE_PASSWORD_SHARING', 'true') == 'true'
    when :bulk_operations
      ENV.fetch('ENABLE_BULK_OPERATIONS', 'true') == 'true'
    when :import_export
      ENV.fetch('ENABLE_IMPORT_EXPORT', 'true') == 'true'
    when :audit_logs
      ENV.fetch('ENABLE_AUDIT_LOGS', 'true') == 'true'
    else
      true
    end
  end

  def self.default_payment_provider
    ENV.fetch('DEFAULT_PAYMENT_PROVIDER', 'mock')
  end

  def self.stripe_secret_key
    ENV['STRIPE_SECRET_KEY']
  end

  def self.stripe_webhook_secret
    ENV['STRIPE_WEBHOOK_SECRET']
  end

  def self.paypal_api_url
    ENV['PAYPAL_API_URL']
  end

  def self.paypal_client_id
    ENV['PAYPAL_CLIENT_ID']
  end

  def self.paypal_client_secret
    ENV['PAYPAL_CLIENT_SECRET']
  end
end

