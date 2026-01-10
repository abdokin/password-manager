class EnvironmentAccess < ApplicationRecord
  belongs_to :environment
  belongs_to :user
  
  validates :role, presence: true, inclusion: { in: %w[viewer editor admin] }
  validates :user_id, uniqueness: { scope: :environment_id }
  
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :admins, -> { where(role: 'admin') }
  scope :editors, -> { where(role: ['editor', 'admin']) }
end

