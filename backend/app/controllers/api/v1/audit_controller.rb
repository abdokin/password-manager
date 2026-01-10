module Api
  module V1
    class AuditController < ApplicationController
      def show
        organization_id = params[:organization_id]
        
        passwords = Password.where(organization_id: organization_id)
        total = passwords.count
        breached = passwords.where(is_breached: true).count
        duplicates = passwords.where(is_duplicate: true).count
        weak = passwords.where(is_weak: true).count
        expired = passwords.where("expires_at < ?", Time.current).count
        expiring_soon = passwords.where("expires_at BETWEEN ? AND ?", Time.current, 30.days.from_now).count
        
        weak_passwords = passwords.where(is_weak: true).limit(10)
        breached_passwords = passwords.where(is_breached: true).limit(10)
        duplicate_passwords = passwords.where(is_duplicate: true).limit(10)
        
        render json: {
          summary: {
            total: total,
            breached: breached,
            duplicates: duplicates,
            weak: weak,
            expired: expired,
            expiring_soon: expiring_soon,
            security_score: calculate_security_score(total, breached, duplicates, weak, expired)
          },
          weak_passwords: weak_passwords,
          breached_passwords: breached_passwords,
          duplicate_passwords: duplicate_passwords
        }
      end
      
      private
      
      def calculate_security_score(total, breached, duplicates, weak, expired)
        return 100 if total == 0
        
        issues = breached + duplicates + weak + expired
        score = 100 - ((issues.to_f / total) * 100)
        [score, 0].max.round(2)
      end
    end
  end
end
