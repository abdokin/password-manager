class ActivityLog < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :organization, optional: true
  
  scope :for_organization, ->(org_id) { where(organization_id: org_id) }
  scope :recent, -> { order(created_at: :desc).limit(100) }
end
