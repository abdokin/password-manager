class PaymentProviders::PayPalProvider < PaymentProviders::BaseProvider
  def initialize(organization)
    super(organization)
    @api_url = EnvConfig.paypal_api_url || 'https://api.sandbox.paypal.com'
    @client_id = EnvConfig.paypal_client_id
    @client_secret = EnvConfig.paypal_client_secret
  end

  def create_customer(email, name)
    {
      id: "paypal_#{SecureRandom.hex(10)}",
      email: email,
      name: name
    }
  end

  def create_subscription(customer_id, plan_id, price_id)
    {
      id: "sub_#{SecureRandom.hex(10)}",
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
      id: "session_#{SecureRandom.hex(10)}",
      url: "#{@api_url}/checkout?session=#{SecureRandom.hex(10)}"
    }
  end

  def handle_webhook(payload, signature)
    parsed = JSON.parse(payload)
    { type: parsed['event_type'], data: parsed }
  rescue JSON::ParserError
    nil
  end
end

