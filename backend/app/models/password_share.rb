class PasswordShare < ApplicationRecord
  belongs_to :password
  belongs_to :shared_by, class_name: 'User'
  belongs_to :shared_with, class_name: 'User'
  
  validates :password_id, uniqueness: { scope: :shared_with_id }
  
  scope :for_user, ->(user_id) { where(shared_with_id: user_id) }
  scope :shared_by_user, ->(user_id) { where(shared_by_id: user_id) }
end

