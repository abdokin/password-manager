class Password < ApplicationRecord
  has_paper_trail
  
  belongs_to :user
  belongs_to :organization
  belongs_to :category, optional: true
  has_many :password_tags, dependent: :destroy
  has_many :tags, through: :password_tags
  
  validates :name, presence: true
  validates :username, presence: true
  validates :password, presence: true
  validates :slug, presence: true, uniqueness: { scope: :organization_id }
  
  before_validation :generate_slug, on: :create
  before_create :check_subscription_limits
  after_save :check_password_strength
  after_save :check_duplicates
  after_save :check_weak_password
  after_create :track_usage
  
  after_update :notify_if_breached
  
  def notify_if_breached
    if saved_change_to_is_breached? && is_breached
      NotificationService.create(
        user,
        "Security Alert: Breached Password",
        "Password '#{name}' has been found in a data breach. Please change it immediately.",
        notification_type: 'error',
        organization: organization,
        action_url: "/passwords/#{id}"
      )
    end
  end
  
  scope :for_organization, ->(org_id) { where(organization_id: org_id) }
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :favorites, -> { where(favorite: true) }
  scope :breached, -> { where(is_breached: true) }
  scope :duplicates, -> { where(is_duplicate: true) }
  scope :weak, -> { where(is_weak: true) }
  scope :expired, -> { where("expires_at < ?", Time.current) }
  scope :expiring_soon, -> { where("expires_at BETWEEN ? AND ?", Time.current, 30.days.from_now) }
  
  def record_usage!
    update!(last_used_at: Time.current)
  end
  
  def toggle_favorite!
    update!(favorite: !favorite)
  end
  
  def expired?
    expires_at.present? && expires_at < Time.current
  end
  
  def expiring_soon?
    expires_at.present? && expires_at.between?(Time.current, 30.days.from_now)
  end
  
  # Get password history using PaperTrail
  def password_history
    versions.where("object_changes LIKE ?", "%password%")
  end
  
  # Get previous password value
  def previous_password
    previous_version = versions.where("object_changes LIKE ?", "%password%").last&.previous
    previous_version&.password if previous_version
  end
  
  # Calculate password strength (0-100)
  def calculate_strength
    score = 0
    pwd = password.to_s
    
    return 0 if pwd.blank?
    
    # Length (max 25 points)
    score += [pwd.length * 2, 25].min
    
    # Lowercase (max 10 points)
    score += 10 if pwd.match?(/[a-z]/)
    
    # Uppercase (max 10 points)
    score += 10 if pwd.match?(/[A-Z]/)
    
    # Numbers (max 10 points)
    score += 10 if pwd.match?(/[0-9]/)
    
    # Special characters (max 15 points)
    score += 15 if pwd.match?(/[^a-zA-Z0-9]/)
    
    # Complexity bonus (max 30 points)
    complexity = 0
    complexity += 1 if pwd.length >= 8
    complexity += 1 if pwd.length >= 12
    complexity += 1 if pwd.length >= 16
    complexity += 1 if pwd.scan(/[a-z]/).length >= 2
    complexity += 1 if pwd.scan(/[A-Z]/).length >= 2
    complexity += 1 if pwd.scan(/[0-9]/).length >= 2
    complexity += 1 if pwd.scan(/[^a-zA-Z0-9]/).length >= 2
    
    score += [complexity * 4, 30].min
    
    [score, 100].min
  end
  
  def strength_label
    case strength_score
    when 0..20 then "Very Weak"
    when 21..40 then "Weak"
    when 41..60 then "Fair"
    when 61..80 then "Good"
    when 81..100 then "Strong"
    else "Unknown"
    end
  end
  
  private
  
  def generate_slug
    self.slug ||= name.parameterize if name.present?
  end
  
  def check_password_strength
    return unless password_changed?
    update_column(:strength_score, calculate_strength)
  end
  
  def check_duplicates
    return unless password_changed?
    
    # Note: In production, you'd need to decrypt and compare
    # For now, we'll mark as duplicate if same encrypted password exists
    # This is a simplified check - in production, use a hash of decrypted password
    duplicates = organization.passwords
                            .where.not(id: id)
                            .where(password: password)
                            .exists?
    
    update_column(:is_duplicate, duplicates)
  end
  
  def check_weak_password
    return unless password_changed?
    update_column(:is_weak, strength_score < 40)
  end
  
  def check_subscription_limits
  end
  
  def track_usage
  end
end


