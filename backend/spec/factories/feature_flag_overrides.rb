FactoryBot.define do
  factory :feature_flag_override do
    association :feature_flag
    enabled { true }
  end
end

