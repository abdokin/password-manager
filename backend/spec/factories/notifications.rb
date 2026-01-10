FactoryBot.define do
  factory :notification do
    title { "Test Notification" }
    message { "This is a test notification" }
    notification_type { "info" }
    association :user
    association :organization
  end
end

