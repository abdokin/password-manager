class Organization < ApplicationRecord
  has_many :passwords, dependent: :destroy
  has_many :organization_members
  has_many :users, through: :organization_members
  has_one :subscription, dependent: :destroy
  has_many :activity_logs, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :tags, dependent: :destroy
  has_many :payments, dependent: :destroy

  validates :name, presence: true
  
  def payment_provider
    read_attribute(:payment_provider) || 'mock'
  end

  def at_password_limit?
    return false unless subscription
    passwords.count >= subscription.password_limit
  end

  def track_password_usage!
    ActivityLog.create(
      organization: self,
      action: 'password_created',
      details: "Password count: #{passwords.count}"
    )
  end
  
  def password_count
    passwords.count
  end
end
