class OrganizationMember < ApplicationRecord
  belongs_to :organization
  belongs_to :user
  
  validates :role, presence: true, inclusion: { in: %w[owner admin member viewer] }
  validates :user_id, uniqueness: { scope: :organization_id }
  
  scope :admins, -> { where(role: ['owner', 'admin']) }
  scope :members, -> { where(role: ['member', 'viewer']) }
end
