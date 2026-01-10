module Api
  module V1
    class PaymentsController < ApplicationController
      before_action :set_organization
      
      def plans
        render json: {
          plans: [
            {
              id: 'free',
              name: 'Free',
              price: 0,
              currency: 'USD',
              interval: 'month',
              features: ['10 passwords', '1 organization', 'Basic support'],
              limits: { passwords: 10 }
            },
            {
              id: 'basic',
              name: 'Basic',
              price: 9.99,
              currency: 'USD',
              interval: 'month',
              features: ['100 passwords', '3 organizations', 'Priority support', 'Import/Export'],
              limits: { passwords: 100 }
            },
            {
              id: 'pro',
              name: 'Pro',
              price: 29.99,
              currency: 'USD',
              interval: 'month',
              features: ['1000 passwords', 'Unlimited organizations', '24/7 support', 'Advanced features'],
              limits: { passwords: 1000 }
            },
            {
              id: 'enterprise',
              name: 'Enterprise',
              price: 99.99,
              currency: 'USD',
              interval: 'month',
              features: ['Unlimited passwords', 'Unlimited organizations', 'Dedicated support', 'All features', 'Custom integrations'],
              limits: { passwords: Float::INFINITY }
            }
          ]
        }
      end
      
      def create_checkout
        plan_id = params[:plan_id]
        return render json: { error: "Plan required" }, status: :bad_request unless plan_id.present?
        
        provider = PaymentProviders::Factory.create(@organization)
        customer_id = @organization.payment_customer_id || create_customer(provider)
        
        price_id = get_price_id_for_plan(plan_id)
        success_url = params[:success_url] || "#{request.base_url}/payments/success"
        cancel_url = params[:cancel_url] || "#{request.base_url}/payments/cancel"
        
        session = provider.create_checkout_session(customer_id, price_id, success_url, cancel_url)
        
        render json: { checkout_url: session[:url] || session['url'], session_id: session[:id] || session['id'] }
      end
      
      def webhook
        provider = PaymentProviders::Factory.create(@organization)
        event = provider.handle_webhook(request.body.read, request.headers['X-Signature'] || '')
        
        return render json: { error: "Invalid webhook" }, status: :bad_request unless event
        
        handle_webhook_event(event)
        render json: { received: true }
      end
      
      def subscription
        subscription = @organization.subscription
        return render json: { error: "No subscription" }, status: :not_found unless subscription
        
        provider = PaymentProviders::Factory.create(@organization)
        provider_subscription = provider.get_subscription(subscription.provider_subscription_id) if subscription.provider_subscription_id
        
        render json: {
          subscription: subscription,
          provider_data: provider_subscription
        }
      end
      
      def cancel_subscription
        subscription = @organization.subscription
        return render json: { error: "No subscription" }, status: :not_found unless subscription
        
        provider = PaymentProviders::Factory.create(@organization)
        provider.cancel_subscription(subscription.provider_subscription_id) if subscription.provider_subscription_id
        
        subscription.update!(status: 'cancelled')
        render json: { message: "Subscription cancelled" }
      end
      
      private
      
      def set_organization
        @organization = Organization.find(params[:organization_id])
      end
      
      def create_customer(provider)
        user = @organization.users.first || current_user
        customer = provider.create_customer(user.email, user.name || user.email)
        @organization.update!(payment_customer_id: customer[:id] || customer['id'])
        customer[:id] || customer['id']
      end
      
      def get_price_id_for_plan(plan_id)
        plan_prices = {
          'free' => 'price_free',
          'basic' => 'price_basic_monthly',
          'pro' => 'price_pro_monthly',
          'enterprise' => 'price_enterprise_monthly'
        }
        plan_prices[plan_id] || plan_prices['basic']
      end
      
      def handle_webhook_event(event)
        event_type = event[:type] || event['type'] || event['event_type']
        
        case event_type
        when /subscription\.(created|updated)/
          handle_subscription_update(event)
        when /payment\.(succeeded|failed)/
          handle_payment_update(event)
        when /subscription\.deleted/
          handle_subscription_cancellation(event)
        end
      end
      
      def handle_subscription_update(event)
        data = event[:data] || event['data'] || {}
        subscription_data = data[:object] || data['object'] || {}
        
        subscription = @organization.subscription || @organization.build_subscription
        subscription.update!(
          plan: subscription_data[:metadata]&.[](:plan_id) || subscription_data['metadata']&.[]('plan_id') || 'basic',
          status: 'active',
          provider_subscription_id: subscription_data[:id] || subscription_data['id'],
          starts_at: Time.at(subscription_data[:current_period_start] || subscription_data['current_period_start'] || Time.current.to_i),
          ends_at: Time.at(subscription_data[:current_period_end] || subscription_data['current_period_end'] || 1.month.from_now.to_i)
        )
      end
      
      def handle_payment_update(event)
        data = event[:data] || event['data'] || {}
        payment_data = data[:object] || data['object'] || {}
        
        Payment.create!(
          organization: @organization,
          amount: payment_data[:amount] || payment_data['amount'] || 0,
          currency: payment_data[:currency] || payment_data['currency'] || 'USD',
          status: event[:type]&.include?('succeeded') ? 'completed' : 'failed',
          payment_provider: @organization.payment_provider,
          provider_payment_id: payment_data[:id] || payment_data['id'],
          completed_at: event[:type]&.include?('succeeded') ? Time.current : nil
        )
      end
      
      def handle_subscription_cancellation(event)
        subscription = @organization.subscription
        return unless subscription
        
        subscription.update!(status: 'cancelled', ends_at: Time.current)
      end
    end
  end
end

