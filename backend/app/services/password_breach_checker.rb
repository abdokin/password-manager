require "net/http"
require "digest"

class PasswordBreachChecker
  API_URL = "https://api.pwnedpasswords.com/range/"
  
  def self.check(password)
    return false if password.blank?
    
    sha1_hash = Digest::SHA1.hexdigest(password).upcase
    prefix = sha1_hash[0..4]
    suffix = sha1_hash[5..-1]
    
    begin
      response = fetch_from_api(prefix)
      return false unless response.is_a?(Net::HTTPSuccess)
      
      breached_hashes = parse_response(response.body)
      breached_hashes.include?(suffix)
    rescue => e
      Rails.logger.error "Password breach check failed: #{e.message}"
      false
    end
  end
  
  def self.check_async(password_id)
    PasswordBreachCheckJob.perform_later(password_id)
  end
  
  private
  
  def self.fetch_from_api(prefix)
    uri = URI("#{API_URL}#{prefix}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 5
    http.open_timeout = 5
    
    request = Net::HTTP::Get.new(uri)
    request["User-Agent"] = "PasswordManager/1.0"
    
    http.request(request)
  end
  
  def self.parse_response(body)
    body.lines.map do |line|
      line.split(":").first.upcase
    end
  end
end

