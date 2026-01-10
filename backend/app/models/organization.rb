class Organization < ApplicationRecord
  has_many :passwords, dependent: :destroy
  has_many :organization_members
  has_many :users, through: :organization_members

  def at_password_limit?
    false
  end

  def track_password_usage!
  end
end
