require 'rails_helper'

RSpec.describe "Feature Flags API", type: :request do
  let(:user) { create(:user) }
  let(:token) { JwtService.encode({ user_id: user.id, email: user.email }) }
  
  before do
    request.headers['Authorization'] = "Bearer #{token}"
  end
  
  describe "GET /api/v1/feature_flags" do
    it "returns feature flags" do
      flag = create(:feature_flag, status: 'enabled')
      
      get "/api/v1/feature_flags", headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json.first['key']).to eq(flag.key)
    end
  end
  
  describe "POST /api/v1/feature_flags" do
    it "creates a feature flag" do
      expect {
        post "/api/v1/feature_flags",
             params: {
               key: "test_feature",
               name: "Test Feature",
               description: "A test feature",
               status: "disabled"
             },
             headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { FeatureFlag.count }.by(1)
      
      expect(response).to have_http_status(:created)
    end
  end
  
  describe "POST /api/v1/feature_flags/:id/toggle" do
    it "toggles a feature flag" do
      flag = create(:feature_flag, status: 'disabled')
      
      post "/api/v1/feature_flags/#{flag.key}/toggle",
           params: { status: 'enabled' },
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      expect(flag.reload.status).to eq('enabled')
    end
  end
  
  describe "POST /api/v1/feature_flags/:id/override" do
    it "sets a user override" do
      flag = create(:feature_flag, status: 'disabled')
      
      post "/api/v1/feature_flags/#{flag.key}/override",
           params: { user_id: user.id, enabled: true },
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      override = FeatureFlagOverride.find_by(feature_flag: flag, user: user)
      expect(override).to be_present
      expect(override.enabled).to be true
    end
  end
end


