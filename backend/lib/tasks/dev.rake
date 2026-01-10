namespace :dev do
  desc "List all user emails and roles"
  task emails: :environment do
    puts "\n" + "="*60
    puts "📧 Development User Accounts"
    puts "="*60
    puts "\n"
    
    User.order(:email).each do |user|
      role_display = user.role || "user"
      orgs = user.organizations.pluck(:name).join(", ")
      orgs_display = orgs.present? ? " | Orgs: #{orgs}" : ""
      
      puts "  Email: #{user.email.ljust(30)} | Role: #{role_display.ljust(12)}#{orgs_display}"
    end
    
    puts "\n" + "-"*60
    puts "Total users: #{User.count}"
    puts "="*60 + "\n"
  end
  
  desc "Show development login info"
  task login_info: :environment do
    puts "\n" + "="*60
    puts "🔐 Development Login Information"
    puts "="*60
    puts "\n"
    
    User.order(:email).each do |user|
      role_display = user.role || "user"
      puts "  Email: #{user.email}"
      puts "  Password: password123"
      puts "  Role: #{role_display}"
      puts "  Name: #{user.name}"
      puts "-"*60
    end
    
    puts "\n💡 All users use the password: password123"
    puts "="*60 + "\n"
  end
  
  desc "Show organization summary"
  task orgs: :environment do
    puts "\n" + "="*60
    puts "🏢 Organizations Summary"
    puts "="*60
    puts "\n"
    
    Organization.all.each do |org|
      member_count = org.organization_members.count
      password_count = org.passwords.count
      env_count = org.environments.count
      owner = org.organization_members.find_by(role: "owner")&.user
      
      puts "  #{org.name}"
      puts "    Owner: #{owner&.email || 'N/A'}"
      puts "    Members: #{member_count}"
      puts "    Passwords: #{password_count}"
      puts "    Environments: #{env_count}"
      puts "-"*60
    end
    
    puts "="*60 + "\n"
  end
  
  desc "Reset database and seed"
  task reset: :environment do
    puts "⚠️  This will destroy all data and reseed!"
    print "Are you sure? (yes/no): "
    confirmation = STDIN.gets.chomp
    
    if confirmation.downcase == 'yes'
      Rake::Task['db:drop'].invoke
      Rake::Task['db:create'].invoke
      Rake::Task['db:migrate'].invoke
      Rake::Task['db:seed'].invoke
      puts "\n✅ Database reset and seeded successfully!"
    else
      puts "❌ Reset cancelled."
    end
  end
end
