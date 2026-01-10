class PaymentProviders::MockProvider < PaymentProviders::BaseProvider
  def create_customer(email, name)
    {
      id: "mock_cus_#{SecureRandom.hex(10)}",
      email: email,
      name: name
    }
  end

  def create_subscription(customer_id, plan_id, price_id)
    {
      id: "mock_sub_#{SecureRandom.hex(10)}",
      status: 'active',
      plan_id: plan_id,
      current_period_end: 1.month.from_now.to_i
    }
  end

  def cancel_subscription(subscription_id)
    { status: 'canceled', id: subscription_id }
  end

  def update_subscription(subscription_id, plan_id, price_id)
    {
      id: subscription_id,
      status: 'active',
      plan_id: plan_id
    }
  end

  def get_subscription(subscription_id)
    {
      id: subscription_id,
      status: 'active',
      current_period_end: 1.month.from_now.to_i
    }
  end

  def create_checkout_session(customer_id, price_id, success_url, cancel_url)
    {
      id: "mock_session_#{SecureRandom.hex(10)}",
      url: "#{success_url}?session=#{SecureRandom.hex(10)}"
    }
  end

  def handle_webhook(payload, signature)
    { type: 'payment.succeeded', data: JSON.parse(payload) }
  rescue JSON::ParserError
    { type: 'payment.succeeded', data: {} }
  end
end

