class PasswordTag < ApplicationRecord
  belongs_to :password
  belongs_to :tag
end
