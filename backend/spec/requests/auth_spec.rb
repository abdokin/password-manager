require 'rails_helper'

RSpec.describe "Auth API", type: :request do
  describe "POST /api/v1/auth/magic_link" do
    it "creates a verification token for existing user" do
      user = create(:user, email: "test@example.com")
      
      post "/api/v1/auth/magic_link", params: { email: "test@example.com" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["message"]).to eq("Magic link sent")
      expect(json["token"]).to be_present
      expect(VerificationToken.count).to eq(1)
    end
    
    it "creates a new user and verification token" do
      expect {
        post "/api/v1/auth/magic_link", params: { email: "new@example.com" }
      }.to change { User.count }.by(1)
      
      expect(response).to have_http_status(:success)
      expect(VerificationToken.count).to eq(1)
    end
  end
  
  describe "POST /api/v1/auth/verify" do
    it "verifies valid token" do
      user = create(:user)
      token = VerificationToken.create!(
        user: user,
        token: SecureRandom.hex(32),
        expires_at: 1.hour.from_now
      )
      
      post "/api/v1/auth/verify", params: { token: token.token }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["user_id"]).to eq(user.id)
      expect(json["email"]).to eq(user.email)
      expect(VerificationToken.count).to eq(0)
    end
    
    it "rejects expired token" do
      user = create(:user)
      token = VerificationToken.create!(
        user: user,
        token: SecureRandom.hex(32),
        expires_at: 1.hour.ago
      )
      
      post "/api/v1/auth/verify", params: { token: token.token }
      
      expect(response).to have_http_status(:unauthorized)
      json = JSON.parse(response.body)
      expect(json["error"]).to eq("Invalid or expired token")
    end
    
    it "rejects invalid token" do
      post "/api/v1/auth/verify", params: { token: "invalid" }
      
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

