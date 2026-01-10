class PaymentProviders::BaseProvider
  def initialize(organization)
    @organization = organization
  end

  def create_customer(email, name)
    raise NotImplementedError, "Subclasses must implement create_customer"
  end

  def create_subscription(customer_id, plan_id, price_id)
    raise NotImplementedError, "Subclasses must implement create_subscription"
  end

  def cancel_subscription(subscription_id)
    raise NotImplementedError, "Subclasses must implement cancel_subscription"
  end

  def update_subscription(subscription_id, plan_id, price_id)
    raise NotImplementedError, "Subclasses must implement update_subscription"
  end

  def get_subscription(subscription_id)
    raise NotImplementedError, "Subclasses must implement get_subscription"
  end

  def create_checkout_session(customer_id, price_id, success_url, cancel_url)
    raise NotImplementedError, "Subclasses must implement create_checkout_session"
  end

  def handle_webhook(payload, signature)
    raise NotImplementedError, "Subclasses must implement handle_webhook"
  end

  protected

  attr_reader :organization
end

