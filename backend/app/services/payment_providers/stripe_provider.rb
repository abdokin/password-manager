require 'stripe' if defined?(Stripe)

class PaymentProviders::StripeProvider < PaymentProviders::BaseProvider
  def initialize(organization)
    super(organization)
    Stripe.api_key = EnvConfig.stripe_secret_key if defined?(Stripe)
  end

  def create_customer(email, name)
    return mock_customer unless defined?(Stripe)
    
    Stripe::Customer.create(
      email: email,
      name: name,
      metadata: { organization_id: organization.id }
    )
  end

  def create_subscription(customer_id, plan_id, price_id)
    return mock_subscription unless defined?(Stripe)
    
    Stripe::Subscription.create(
      customer: customer_id,
      items: [{ price: price_id }],
      metadata: { organization_id: organization.id, plan_id: plan_id }
    )
  end

  def cancel_subscription(subscription_id)
    return { status: 'canceled' } unless defined?(Stripe)
    
    subscription = Stripe::Subscription.retrieve(subscription_id)
    subscription.cancel_at_period_end = true
    subscription.save
    subscription
  end

  def update_subscription(subscription_id, plan_id, price_id)
    return mock_subscription unless defined?(Stripe)
    
    subscription = Stripe::Subscription.retrieve(subscription_id)
    subscription.items = [{
      id: subscription.items.data[0].id,
      price: price_id
    }]
    subscription.metadata = { plan_id: plan_id }
    subscription.save
    subscription
  end

  def get_subscription(subscription_id)
    return mock_subscription unless defined?(Stripe)
    Stripe::Subscription.retrieve(subscription_id)
  end

  def create_checkout_session(customer_id, price_id, success_url, cancel_url)
    return { url: success_url } unless defined?(Stripe)
    
    Stripe::Checkout::Session.create(
      customer: customer_id,
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: { organization_id: organization.id }
    )
  end

  def handle_webhook(payload, signature)
    return { type: 'payment_intent.succeeded' } unless defined?(Stripe)
    
    event = Stripe::Webhook.construct_event(
      payload,
      signature,
      EnvConfig.stripe_webhook_secret
    )
    event
  rescue Stripe::SignatureVerificationError
    nil
  end

  private

  def mock_customer
    { id: "cus_#{SecureRandom.hex(10)}", email: organization.users.first&.email }
  end

  def mock_subscription
    {
      id: "sub_#{SecureRandom.hex(10)}",
      status: 'active',
      current_period_end: 1.month.from_now.to_i
    }
  end
end

