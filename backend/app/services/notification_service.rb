class NotificationService
  def self.create(user, title, message, notification_type: 'info', organization: nil, action_url: nil)
    notification = Notification.create!(
      user: user,
      organization: organization,
      title: title,
      message: message,
      notification_type: notification_type,
      action_url: action_url
    )
    
    broadcast_notification(notification)
    notification
  end

  def self.broadcast_notification(notification)
    ActionCable.server.broadcast(
      "notifications:#{notification.user_id}",
      {
        type: 'notification',
        data: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          notification_type: notification.notification_type,
          action_url: notification.action_url,
          created_at: notification.created_at,
          read_at: notification.read_at
        }
      }
    )
  end

  def self.broadcast_to_organization(organization, title, message, notification_type: 'info', action_url: nil)
    organization.users.each do |user|
      create(user, title, message, notification_type: notification_type, organization: organization, action_url: action_url)
    end
  end
end

