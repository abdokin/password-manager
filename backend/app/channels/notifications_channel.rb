class NotificationsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "notifications:#{current_user.id}"
    
    # Send any unread notifications on connect
    unread_notifications = Notification.where(user: current_user, read_at: nil).recent.limit(10)
    unread_notifications.each do |notification|
      transmit({
        type: 'notification',
        data: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          notification_type: notification.notification_type,
          action_url: notification.action_url,
          created_at: notification.created_at
        }
      })
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def mark_as_read(data)
    notification = Notification.find_by(id: data['id'], user: current_user)
    return unless notification

    notification.mark_as_read!
    transmit({
      type: 'notification_read',
      id: notification.id
    })
  end
end

