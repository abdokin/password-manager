FactoryBot.define do
  factory :feature_flag do
    key { "test_feature_#{SecureRandom.hex(4)}" }
    name { "Test Feature" }
    description { "A test feature flag" }
    status { "disabled" }
    category { "beta" }
  end
end


