class Payment < ApplicationRecord
  belongs_to :organization
  
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :currency, presence: true
  validates :status, presence: true, inclusion: { in: %w[pending completed failed refunded] }
  validates :payment_provider, presence: true
  
  scope :completed, -> { where(status: 'completed') }
  scope :pending, -> { where(status: 'pending') }
  scope :failed, -> { where(status: 'failed') }
  
  def complete!
    update!(status: 'completed', completed_at: Time.current)
  end
  
  def fail!
    update!(status: 'failed', failed_at: Time.current)
  end
end

