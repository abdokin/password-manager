require 'rails_helper'

RSpec.describe "Payments API", type: :request do
  let(:organization) { create(:organization) }
  let(:user) { create(:user) }
  let(:token) { JwtService.encode({ user_id: user.id, email: user.email }) }
  
  before do
    request.headers['Authorization'] = "Bearer #{token}"
  end
  
  describe "GET /api/v1/organizations/:id/payments/plans" do
    it "returns available subscription plans" do
      get "/api/v1/organizations/#{organization.id}/payments/plans",
          headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["plans"]).to be_an(Array)
      expect(json["plans"].length).to be > 0
      expect(json["plans"].first).to have_key("id")
      expect(json["plans"].first).to have_key("name")
      expect(json["plans"].first).to have_key("price")
    end
  end
  
  describe "POST /api/v1/organizations/:id/payments/checkout" do
    it "creates a checkout session" do
      post "/api/v1/organizations/#{organization.id}/payments/checkout",
           params: { plan_id: "basic" },
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json).to have_key("checkout_url")
    end
    
    it "requires a plan_id" do
      post "/api/v1/organizations/#{organization.id}/payments/checkout",
           params: {},
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:bad_request)
    end
  end
  
  describe "POST /api/v1/organizations/:id/payments/cancel" do
    it "cancels an active subscription" do
      subscription = create(:subscription, organization: organization, status: 'active', provider_subscription_id: 'sub_test')
      
      post "/api/v1/organizations/#{organization.id}/payments/cancel",
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      expect(subscription.reload.status).to eq('cancelled')
    end
  end
end

