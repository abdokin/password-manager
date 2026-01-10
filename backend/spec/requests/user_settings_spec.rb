require 'rails_helper'

RSpec.describe "User Settings API", type: :request do
  let(:user) { create(:user) }
  let(:token) { JwtService.encode({ user_id: user.id, email: user.email }) }

  before do
    request.headers['Authorization'] = "Bearer #{token}"
  end

  describe "GET /api/v1/user_settings" do
    it "returns all user settings" do
      UserSetting.set(user, "theme", "dark")
      UserSetting.set(user, "notifications", "true")
      
      get "/api/v1/user_settings", headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["theme"]).to eq("dark")
      expect(json["notifications"]).to eq("true")
    end
  end

  describe "POST /api/v1/user_settings" do
    it "creates a new setting" do
      expect {
        post "/api/v1/user_settings",
             params: { key: "theme", value: "dark" },
             headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { UserSetting.count }.by(1)
      
      expect(response).to have_http_status(:created)
      expect(UserSetting.get(user, "theme")).to eq("dark")
    end
  end

  describe "PUT /api/v1/user_settings/:key" do
    it "updates an existing setting" do
      UserSetting.set(user, "theme", "light")
      
      put "/api/v1/user_settings/theme",
          params: { value: "dark" },
          headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      expect(UserSetting.get(user, "theme")).to eq("dark")
    end
  end
end

