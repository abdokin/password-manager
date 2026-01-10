class Subscription < ApplicationRecord
  belongs_to :organization
  
  validates :plan, presence: true, inclusion: { in: %w[free basic pro enterprise] }
  validates :status, presence: true, inclusion: { in: %w[active cancelled expired] }
  
  scope :active, -> { where(status: 'active') }
  
  def password_limit
    case plan
    when 'free' then 10
    when 'basic' then 100
    when 'pro' then 1000
    when 'enterprise' then Float::INFINITY
    else 10
    end
  end
end
