class FeatureFlag < ApplicationRecord
  validates :key, presence: true, uniqueness: true
  validates :name, presence: true
  validates :status, inclusion: { in: %w[enabled disabled] }
  
  scope :enabled, -> { where(status: 'enabled') }
  scope :disabled, -> { where(status: 'disabled') }
  
  def enabled?
    status == 'enabled'
  end
  
  def disabled?
    status == 'disabled'
  end
  
  def enabled_for?(user: nil, organization: nil)
    return false unless enabled?
    
    # Check user-specific overrides
    if user
      user_override = FeatureFlagOverride.find_by(feature_flag: self, user: user)
      return user_override.enabled? if user_override
    end
    
    # Check organization-specific overrides
    if organization
      org_override = FeatureFlagOverride.find_by(feature_flag: self, organization: organization)
      return org_override.enabled? if org_override
    end
    
    enabled?
  end
end

