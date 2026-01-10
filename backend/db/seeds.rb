if Rails.env.development?
  ActiveRecord::Base.transaction do
    if ActiveRecord::Base.connection.adapter_name == 'SQLite'
      ActiveRecord::Base.connection.execute("PRAGMA foreign_keys = OFF")
    end
    
    [PasswordTag, Password, Tag, Category, EnvironmentVariable, EnvironmentAccess, Environment, 
     OrganizationMember, Subscription, Payment, Invoice, Notification, 
     ApiKey, UserSetting, VerificationToken, Organization, User].each do |model|
      model.delete_all
    end
    
    if ActiveRecord::Base.connection.adapter_name == 'SQLite'
      ActiveRecord::Base.connection.execute("PRAGMA foreign_keys = ON")
    end
  end
end

users = [
  { email: "admin@example.com", name: "Admin User", role: "super_admin", password: "password123" },
  { email: "john@example.com", name: "John Doe", role: "admin", password: "password123" },
  { email: "jane@example.com", name: "Jane Smith", role: "user", password: "password123" },
  { email: "bob@example.com", name: "Bob Johnson", role: "user", password: "password123" },
  { email: "alice@example.com", name: "Alice Williams", role: "user", password: "password123" },
  { email: "charlie@example.com", name: "Charlie Brown", role: "user", password: "password123" },
]

created_users = users.map do |user_data|
  user = User.find_or_create_by(email: user_data[:email]) do |u|
    u.name = user_data[:name]
    u.role = user_data[:role]
    u.password = user_data[:password]
  end
  
  if user.password_digest.blank? || !user.authenticate(user_data[:password])
    user.password = user_data[:password]
    user.save
  end
  
  user.update(name: user_data[:name], role: user_data[:role]) if user.name != user_data[:name] || user.role != user_data[:role]
  
  user
end

organizations = [
  { name: "Acme Corp", owner: created_users[0] },
  { name: "Tech Startup Inc", owner: created_users[1] },
  { name: "Design Studio", owner: created_users[2] },
]

created_orgs = organizations.map do |org_data|
  org = Organization.find_or_create_by(name: org_data[:name])
  
  OrganizationMember.find_or_create_by(organization: org, user: org_data[:owner]) do |om|
    om.role = "owner"
  end
  
  Subscription.find_or_create_by(organization: org) do |s|
    s.plan = ["free", "basic", "pro"].sample
    s.status = "active"
  end
  
  org
end

OrganizationMember.find_or_create_by(organization: created_orgs[0], user: created_users[1]) do |om|
  om.role = "admin"
end

[created_users[2], created_users[3]].each do |user|
  OrganizationMember.find_or_create_by(organization: created_orgs[0], user: user) do |om|
    om.role = "member"
  end
end

OrganizationMember.find_or_create_by(organization: created_orgs[1], user: created_users[4]) do |om|
  om.role = "member"
end

categories_data = [
  { name: "Social Media", organization: created_orgs[0] },
  { name: "Email", organization: created_orgs[0] },
  { name: "Banking", organization: created_orgs[0] },
  { name: "Work", organization: created_orgs[0] },
  { name: "Personal", organization: created_orgs[0] },
  { name: "Development", organization: created_orgs[1] },
  { name: "Production", organization: created_orgs[1] },
]

created_categories = categories_data.map do |cat_data|
  Category.find_or_create_by(name: cat_data[:name], organization_id: cat_data[:organization].id)
end

tags_data = [
  { name: "important", organization: created_orgs[0] },
  { name: "shared", organization: created_orgs[0] },
  { name: "2fa", organization: created_orgs[0] },
  { name: "expires-soon", organization: created_orgs[0] },
  { name: "api", organization: created_orgs[1] },
  { name: "database", organization: created_orgs[1] },
]

created_tags = tags_data.map do |tag_data|
  Tag.find_or_create_by(name: tag_data[:name], organization_id: tag_data[:organization].id)
end

passwords_data = [
  { name: "Gmail Account", username: "john@example.com", password: "SecurePass123!", url: "https://gmail.com", 
    organization: created_orgs[0], user: created_users[0], category: created_categories[1], favorite: true },
  { name: "Facebook", username: "john.doe", password: "FbPass2024!", url: "https://facebook.com", 
    organization: created_orgs[0], user: created_users[0], category: created_categories[0] },
  { name: "Twitter/X", username: "@johndoe", password: "TwitX2024!", url: "https://x.com", 
    organization: created_orgs[0], user: created_users[1], category: created_categories[0], favorite: true },
  { name: "Chase Bank", username: "john.doe", password: "BankPass123!", url: "https://chase.com", 
    organization: created_orgs[0], user: created_users[0], category: created_categories[2], 
    expires_at: 6.months.from_now },
  { name: "GitHub", username: "johndoe", password: "GitHub2024!", url: "https://github.com", 
    organization: created_orgs[0], user: created_users[1], category: created_categories[3] },
  { name: "Slack", username: "john@acme.com", password: "Slack2024!", url: "https://slack.com", 
    organization: created_orgs[0], user: created_users[2], category: created_categories[3] },
  { name: "AWS Console", username: "admin@acme", password: "AWS2024Secure!", url: "https://aws.amazon.com", 
    organization: created_orgs[0], user: created_users[0], category: created_categories[3], favorite: true },
  { name: "LinkedIn", username: "john.doe@email.com", password: "LinkedIn123!", url: "https://linkedin.com", 
    organization: created_orgs[0], user: created_users[1], category: created_categories[0] },
  { name: "Instagram", username: "johndoe", password: "Insta2024!", url: "https://instagram.com", 
    organization: created_orgs[0], user: created_users[2], category: created_categories[0] },
  { name: "Netflix", username: "john@example.com", password: "Netflix2024!", url: "https://netflix.com", 
    organization: created_orgs[0], user: created_users[3], category: created_categories[4] },
  { name: "Stripe API", username: "api_key", password: "sk_live_abc123xyz789", url: "https://stripe.com", 
    organization: created_orgs[1], user: created_users[1], category: created_categories[5] },
  { name: "MongoDB Atlas", username: "admin", password: "MongoDB2024!", url: "https://mongodb.com", 
    organization: created_orgs[1], user: created_users[1], category: created_categories[6] },
  { name: "Heroku", username: "dev@techstartup.com", password: "Heroku2024!", url: "https://heroku.com", 
    organization: created_orgs[1], user: created_users[4], category: created_categories[5] },
]

created_passwords = passwords_data.map do |pwd_data|
  password = Password.create!(
    name: pwd_data[:name],
    username: pwd_data[:username],
    password: pwd_data[:password],
    url: pwd_data[:url],
    organization: pwd_data[:organization],
    user: pwd_data[:user],
    category: pwd_data[:category],
    favorite: pwd_data[:favorite] || false,
    expires_at: pwd_data[:expires_at],
    notes: pwd_data[:notes]
  )
  
  if pwd_data[:name].include?("API") || pwd_data[:name].include?("Stripe")
    password.tags << created_tags[4] if created_tags[4]
  end
  if pwd_data[:favorite]
    password.tags << created_tags[0] if created_tags[0]
  end
  
  password
end

environments_data = [
  { name: "Production", environment_type: "production", organization: created_orgs[0] },
  { name: "Staging", environment_type: "staging", organization: created_orgs[0] },
  { name: "Development", environment_type: "development", organization: created_orgs[0] },
  { name: "Production", environment_type: "production", organization: created_orgs[1] },
  { name: "Development", environment_type: "development", organization: created_orgs[1] },
]

created_environments = environments_data.map do |env_data|
  Environment.find_or_create_by(name: env_data[:name], organization: env_data[:organization]) do |e|
    e.environment_type = env_data[:environment_type]
    e.description = "#{env_data[:environment_type].capitalize} environment for #{env_data[:organization].name}"
  end
end

env_vars_data = [
  { environment: created_environments[0], key: "DATABASE_URL", value: "postgresql://prod:password@db.example.com:5432/prod_db", encrypted: true },
  { environment: created_environments[0], key: "API_KEY", value: "prod_api_key_12345", encrypted: true },
  { environment: created_environments[0], key: "APP_ENV", value: "production", encrypted: false },
  { environment: created_environments[1], key: "DATABASE_URL", value: "postgresql://staging:password@db.example.com:5432/staging_db", encrypted: true },
  { environment: created_environments[1], key: "API_KEY", value: "staging_api_key_67890", encrypted: true },
  { environment: created_environments[2], key: "DATABASE_URL", value: "postgresql://dev:password@localhost:5432/dev_db", encrypted: false },
  { environment: created_environments[2], key: "DEBUG", value: "true", encrypted: false },
  { environment: created_environments[3], key: "STRIPE_SECRET_KEY", value: "sk_live_prod_key", encrypted: true },
  { environment: created_environments[4], key: "STRIPE_SECRET_KEY", value: "sk_test_dev_key", encrypted: false },
]

env_vars_data.each do |var_data|
  EnvironmentVariable.find_or_create_by(environment: var_data[:environment], key: var_data[:key]) do |ev|
    ev.value = var_data[:value]
    ev.encrypted = var_data[:encrypted]
  end
end

api_keys_data = [
  { name: "Frontend App", user: created_users[0], organization: created_orgs[0] },
  { name: "Mobile App", user: created_users[1], organization: created_orgs[0] },
  { name: "Integration Service", user: created_users[1], organization: created_orgs[1] },
]

api_keys_data.each do |key_data|
  key = SecureRandom.hex(32)
  secret = SecureRandom.hex(32)
  
  ApiKey.find_or_create_by(name: key_data[:name], user: key_data[:user], organization: key_data[:organization]) do |ak|
    ak.key = key
    ak.secret = secret
    ak.expires_at = 1.year.from_now
  end
end

notifications_data = [
  { user: created_users[0], title: "Welcome!", message: "Welcome to Password Manager", notification_type: "info", organization: created_orgs[0] },
  { user: created_users[1], title: "Password Expiring", message: "Your Chase Bank password expires in 30 days", notification_type: "warning", organization: created_orgs[0] },
  { user: created_users[0], title: "New Team Member", message: "Jane Smith joined Acme Corp", notification_type: "success", organization: created_orgs[0] },
]

notifications_data.each do |notif_data|
  Notification.create!(
    user: notif_data[:user],
    title: notif_data[:title],
    message: notif_data[:message],
    notification_type: notif_data[:notification_type],
    organization: notif_data[:organization],
    read_at: nil
  )
end

feature_flags_data = [
  { key: "new_dashboard", name: "New Dashboard", description: "Enable the new dashboard UI", category: "beta", status: "enabled" },
  { key: "dark_mode", name: "Dark Mode", description: "Enable dark mode theme", category: "production", status: "enabled" },
  { key: "api_v2", name: "API v2", description: "Enable API version 2 endpoints", category: "experimental", status: "disabled" },
  { key: "bulk_operations", name: "Bulk Operations", description: "Enable bulk password operations", category: "production", status: "enabled" },
]

feature_flags_data.each do |flag_data|
  FeatureFlag.find_or_create_by(key: flag_data[:key]) do |ff|
    ff.name = flag_data[:name]
    ff.description = flag_data[:description]
    ff.category = flag_data[:category]
    ff.status = flag_data[:status]
  end
end

puts "Seed completed successfully!"
puts "\nDevelopment User Accounts:"
created_users.each do |user|
  role_display = user.role || "user"
  puts "  Email: #{user.email.ljust(25)} | Password: password123 | Role: #{role_display}"
end
puts "\nOrganizations:"
created_orgs.each do |org|
  member_count = org.organization_members.count
  password_count = org.passwords.count
  puts "  #{org.name} (#{member_count} members, #{password_count} passwords)"
end
