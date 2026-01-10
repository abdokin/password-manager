FactoryBot.define do
  factory :tag do
    name { "Important" }
    association :organization
  end
end
