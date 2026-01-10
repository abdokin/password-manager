FactoryBot.define do
  factory :password do
    name { "Test Site" }
    username { "testuser" }
    password { "testpassword123" }
    slug { "test-site" }
    association :user
    association :organization
  end
end
