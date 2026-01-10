class Invoice < ApplicationRecord
  belongs_to :organization
  
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :currency, presence: true
  validates :status, presence: true, inclusion: { in: %w[draft pending paid failed cancelled] }
  
  scope :paid, -> { where(status: 'paid') }
  scope :pending, -> { where(status: 'pending') }
  scope :overdue, -> { where(status: 'pending').where('due_date < ?', Time.current) }
  
  def mark_as_paid!
    update!(status: 'paid', paid_at: Time.current)
  end
  
  def overdue?
    status == 'pending' && due_date.present? && due_date < Time.current
  end
end
