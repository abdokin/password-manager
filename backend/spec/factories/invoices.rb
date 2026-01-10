FactoryBot.define do
  factory :invoice do
    invoice_number { "INV-#{SecureRandom.hex(8).upcase}" }
    amount { 29.99 }
    currency { "USD" }
    status { "paid" }
    issue_date { Date.today }
    due_date { 30.days.from_now }
    association :organization
  end
end
