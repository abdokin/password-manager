class FeatureFlagService
  def self.enabled?(key, user: nil, organization: nil)
    flag = FeatureFlag.find_by(key: key)
    return false unless flag
    
    flag.enabled_for?(user: user, organization: organization)
  end
  
  def self.enabled_flags(user: nil, organization: nil)
    FeatureFlag.enabled.map do |flag|
      {
        key: flag.key,
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled_for?(user: user, organization: organization),
        category: flag.category,
        metadata: flag.metadata
      }
    end
  end
  
  def self.create_flag(key, name, description: nil, category: nil, status: 'disabled', metadata: {})
    FeatureFlag.create!(
      key: key,
      name: name,
      description: description,
      category: category,
      status: status,
      metadata: metadata
    )
  end
  
  def self.toggle_flag(key, status)
    flag = FeatureFlag.find_by(key: key)
    return false unless flag
    
    flag.update!(status: status)
    flag
  end
  
  def self.set_override(key, user: nil, organization: nil, enabled: true)
    flag = FeatureFlag.find_by(key: key)
    return false unless flag
    
    override = FeatureFlagOverride.find_or_initialize_by(
      feature_flag: flag,
      user: user,
      organization: organization
    )
    override.update!(enabled: enabled)
    override
  end
  
  def self.remove_override(key, user: nil, organization: nil)
    flag = FeatureFlag.find_by(key: key)
    return false unless flag
    
    override = FeatureFlagOverride.find_by(
      feature_flag: flag,
      user: user,
      organization: organization
    )
    override&.destroy
  end
end

