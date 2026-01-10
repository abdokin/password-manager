FactoryBot.define do
  factory :password_share do
    association :password
    association :shared_by, factory: :user
    association :shared_with, factory: :user
    can_edit { false }
  end
end

