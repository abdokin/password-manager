FactoryBot.define do
  factory :environment do
    name { "Development" }
    environment_type { "development" }
    description { "Development environment" }
    association :organization
  end
end

