class UserSetting < ApplicationRecord
  belongs_to :user
  
  validates :key, presence: true, uniqueness: { scope: :user_id }
  
  def self.get(user, key, default = nil)
    setting = find_by(user: user, key: key)
    setting ? setting.value : default
  end
  
  def self.set(user, key, value)
    setting = find_or_initialize_by(user: user, key: key)
    setting.value = value
    setting.save!
  end
end

