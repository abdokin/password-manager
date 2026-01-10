class JwtService
  SECRET_KEY = EnvConfig.jwt_secret_key
  EXPIRATION_HOURS = EnvConfig.jwt_expiration_hours

  def self.encode(payload, exp = nil)
    exp ||= EXPIRATION_HOURS.hours.from_now
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError
    nil
  end
end
