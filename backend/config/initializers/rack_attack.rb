begin
  require 'rack/attack'
  
  Rack::Attack.throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  Rack::Attack.throttle('logins/email', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/login' && req.post?
      req.params['email'].to_s.downcase.gsub(/\s+/, "")
    end
  end

  Rack::Attack.throttle('api/ip', limit: 100, period: 1.minute) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  Rack::Attack.throttled_response = lambda do |env|
    retry_after = (env['rack.attack.match_data'] || {})[:period]
    [
      429,
      {
        'Content-Type' => 'application/json',
        'Retry-After' => retry_after.to_s
      },
      [{ error: 'Rate limit exceeded. Please try again later.' }.to_json]
    ]
  end
rescue LoadError
  Rails.logger.warn "rack-attack gem not available, rate limiting disabled"
end
