class User < ApplicationRecord
  has_many :passwords, dependent: :destroy
  has_many :organization_members
  has_many :organizations, through: :organization_members
end
