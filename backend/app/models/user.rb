class User < ApplicationRecord
  has_many :passwords, dependent: :destroy
  has_many :organization_members
  has_many :organizations, through: :organization_members
  has_many :verification_tokens, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :api_keys, dependent: :destroy
  has_many :user_settings, dependent: :destroy
end
