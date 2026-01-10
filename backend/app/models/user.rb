class User < ApplicationRecord
  has_secure_password
  
  has_many :passwords, dependent: :destroy
  has_many :organization_members
  has_many :organizations, through: :organization_members
  has_many :verification_tokens, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :api_keys, dependent: :destroy
  has_many :user_settings, dependent: :destroy
  
  validates :email, presence: true, uniqueness: true
  validates :role, inclusion: { in: %w[user admin super_admin] }, allow_nil: true
  
  scope :admins, -> { where(role: ['admin', 'super_admin']) }
  scope :regular_users, -> { where(role: ['user', nil]) }
  
  def admin?
    role == 'admin' || role == 'super_admin'
  end
  
  def super_admin?
    role == 'super_admin'
  end
end
