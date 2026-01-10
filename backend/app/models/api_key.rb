class ApiKey < ApplicationRecord
  belongs_to :user
  belongs_to :organization, optional: true
  
  before_create :generate_key
  
  validates :name, presence: true
  validates :key, uniqueness: true
  
  scope :active, -> { where(revoked_at: nil) }
  scope :revoked, -> { where.not(revoked_at: nil) }
  
  def active?
    revoked_at.nil? && expires_at.nil? || expires_at > Time.current
  end
  
  def revoke!
    update!(revoked_at: Time.current)
  end
  
  private
  
  def generate_key
    self.key = "pk_#{SecureRandom.hex(32)}"
    self.secret = "sk_#{SecureRandom.hex(32)}"
  end
end

