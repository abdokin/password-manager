class Environment < ApplicationRecord
  belongs_to :organization
  has_many :environment_variables, dependent: :destroy
  has_many :environment_accesses, dependent: :destroy
  has_many :users, through: :environment_accesses
  
  validates :name, presence: true, uniqueness: { scope: :organization_id }
  validates :environment_type, presence: true, inclusion: { in: %w[development staging production test] }
  
  scope :for_organization, ->(org_id) { where(organization_id: org_id) }
  scope :by_type, ->(type) { where(environment_type: type) }
  
  def add_variable(key, value, encrypted: false)
    environment_variables.create!(
      key: key,
      value: value,
      encrypted: encrypted
    )
  end
  
  def get_variable(key)
    var = environment_variables.find_by(key: key)
    return nil unless var
    var.encrypted? ? decrypt_value(var.value) : var.value
  end
  
  def grant_access(user, role: 'viewer')
    environment_accesses.find_or_create_by(user: user) do |access|
      access.role = role
    end
  end
  
  def revoke_access(user)
    environment_accesses.where(user: user).destroy_all
  end
  
  def has_access?(user)
    environment_accesses.exists?(user: user)
  end
  
  def can_edit?(user)
    access = environment_accesses.find_by(user: user)
    access&.role == 'editor' || access&.role == 'admin'
  end
  
  private
  
  def decrypt_value(encrypted_value)
    EncryptionService.decrypt(encrypted_value)
  end
end

