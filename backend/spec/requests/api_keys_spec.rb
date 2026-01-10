require 'rails_helper'

RSpec.describe "API Keys API", type: :request do
  let(:user) { create(:user) }
  let(:token) { JwtService.encode({ user_id: user.id, email: user.email }) }
  
  before do
    request.headers['Authorization'] = "Bearer #{token}"
  end
  
  describe "GET /api/v1/api_keys" do
    it "returns user's API keys" do
      api_key = create(:api_key, user: user)
      
      get "/api/v1/api_keys", headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
    end
  end
  
  describe "POST /api/v1/api_keys" do
    it "creates a new API key" do
      expect {
        post "/api/v1/api_keys",
             params: { name: "Test Key" },
             headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { ApiKey.count }.by(1)
      
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["key"]).to be_present
      expect(json["secret"]).to be_present
    end
  end
  
  describe "POST /api/v1/api_keys/:key/revoke" do
    it "revokes an API key" do
      api_key = create(:api_key, user: user)
      
      post "/api/v1/api_keys/#{api_key.key}/revoke",
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      expect(api_key.reload.revoked_at).to be_present
    end
  end
end


