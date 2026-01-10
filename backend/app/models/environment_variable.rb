class EnvironmentVariable < ApplicationRecord
  belongs_to :environment
  
  validates :key, presence: true, uniqueness: { scope: :environment_id }
  validates :value, presence: true
  
  before_save :encrypt_if_needed
  
  scope :encrypted, -> { where(encrypted: true) }
  scope :plain, -> { where(encrypted: false) }
  
  def decrypted_value
    encrypted? ? EncryptionService.decrypt(value) : value
  end
  
  def mask_value
    return value unless encrypted?
    return "****" if value.length < 10
    "#{value[0..3]}...#{value[-4..-1]}"
  end
  
  private
  
  def encrypt_if_needed
    if encrypted? && !value.start_with?('encrypted:')
      self.value = EncryptionService.encrypt(value)
    end
  end
end

