require 'rails_helper'

RSpec.describe NotificationsChannel, type: :channel do
  let(:user) { create(:user) }
  let(:token) { JwtService.encode({ user_id: user.id, email: user.email }) }

  before do
    stub_connection current_user: user
  end

  it "subscribes to notifications stream" do
    subscribe
    expect(subscription).to be_confirmed
    expect(streams).to include("notifications:#{user.id}")
  end

  it "sends unread notifications on subscribe" do
    notification = create(:notification, user: user, read_at: nil)
    subscribe
    expect(transmissions.last).to include('type' => 'notification')
  end

  it "marks notification as read" do
    notification = create(:notification, user: user, read_at: nil)
    subscribe
    perform :mark_as_read, { 'id' => notification.id }
    expect(notification.reload.read_at).to be_present
  end
end

