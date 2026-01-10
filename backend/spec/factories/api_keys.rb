FactoryBot.define do
  factory :api_key do
    name { "Test API Key" }
    association :user
    association :organization
  end
end

