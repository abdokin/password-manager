FactoryBot.define do
  factory :environment_variable do
    key { "DATABASE_URL" }
    value { "postgresql://localhost:5432/db" }
    encrypted { false }
    association :environment
  end
end

