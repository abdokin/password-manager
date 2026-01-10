class Tag < ApplicationRecord
  has_many :password_tags
  has_many :passwords, through: :password_tags
end
