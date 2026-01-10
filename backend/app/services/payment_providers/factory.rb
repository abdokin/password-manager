class PaymentProviders::Factory
  PROVIDERS = {
    'stripe' => PaymentProviders::StripeProvider,
    'paypal' => PaymentProviders::PayPalProvider,
    'mock' => PaymentProviders::MockProvider
  }.freeze

  def self.create(organization)
    provider_name = organization.payment_provider || EnvConfig.default_payment_provider || 'mock'
    provider_class = PROVIDERS[provider_name] || PROVIDERS['mock']
    provider_class.new(organization)
  end
end

