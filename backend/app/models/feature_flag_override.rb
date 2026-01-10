class FeatureFlagOverride < ApplicationRecord
  belongs_to :feature_flag
  belongs_to :user, optional: true
  belongs_to :organization, optional: true
  
  validates :enabled, inclusion: { in: [true, false] }
  validate :user_or_organization_present
  
  scope :for_user, ->(user) { where(user: user) }
  scope :for_organization, ->(org) { where(organization: org) }
  
  private
  
  def user_or_organization_present
    unless user_id.present? || organization_id.present?
      errors.add(:base, "Either user or organization must be present")
    end
  end
end

