class Category < ApplicationRecord
  has_many :passwords, dependent: :destroy
end
