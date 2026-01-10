FactoryBot.define do
  factory :category do
    name { "Work" }
    association :organization
  end
end
