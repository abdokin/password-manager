class PasswordBreachCheckJob < ApplicationJob
  queue_as :default
  
  def perform(password_id)
    password = Password.find_by(id: password_id)
    return unless password
    
    # Decrypt password for checking
    decrypted_password = decrypt_password(password.password)
    return unless decrypted_password
    
    is_breached = PasswordBreachChecker.check(decrypted_password)
    
    password.update!(
      is_breached: is_breached,
      last_checked_at: Time.current
    )
    
    if is_breached
      notify_breach(password)
    end
  end
  
  private
  
  def decrypt_password(encrypted_password)
    encryption_service = EncryptionService.new
    encryption_service.decrypt(encrypted_password)
  rescue => e
    Rails.logger.error "Failed to decrypt password for breach check: #{e.message}"
    nil
  end
  
  def notify_breach(password)
    # Log breach detection
    ActivityLog.log(
      user: password.user,
      organization: password.organization,
      action: "password_breach_detected",
      resource: password,
      request: nil
    )
    
    # TODO: Send email notification to user
    # BreachNotificationMailer.password_breached(password).deliver_later
  end
end

