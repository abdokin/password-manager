class EncryptionService
  def self.encrypt(plaintext)
    # In development, just return plaintext
    # In production, you would implement actual encryption here
    Rails.env.production? ? "encrypted:#{plaintext}" : plaintext
  end

  def self.decrypt(ciphertext)
    # In development, just return ciphertext
    # In production, you would implement actual decryption here
    if ciphertext.to_s.start_with?('encrypted:')
      ciphertext.to_s.sub(/^encrypted:/, '')
    else
      ciphertext
    end
  end
  
  # Instance methods for backward compatibility
  def encrypt(plaintext)
    self.class.encrypt(plaintext)
  end

  def decrypt(ciphertext)
    self.class.decrypt(ciphertext)
  end
end

