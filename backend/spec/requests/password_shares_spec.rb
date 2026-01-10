require 'rails_helper'

RSpec.describe "Password Shares API", type: :request do
  let(:user1) { create(:user, email: "user1@example.com") }
  let(:user2) { create(:user, email: "user2@example.com") }
  let(:organization) { create(:organization) }
  let(:password) { create(:password, user: user1, organization: organization) }
  let(:token) { JwtService.encode({ user_id: user1.id, email: user1.email }) }

  before do
    request.headers['Authorization'] = "Bearer #{token}"
  end

  describe "GET /api/v1/password_shares" do
    it "returns shared passwords for current user" do
      PasswordShare.create!(
        password: password,
        shared_by: user1,
        shared_with: user2
      )
      
      token2 = JwtService.encode({ user_id: user2.id, email: user2.email })
      get "/api/v1/password_shares", headers: { 'Authorization' => "Bearer #{token2}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
    end
  end

  describe "POST /api/v1/password_shares" do
    it "creates a password share" do
      expect {
        post "/api/v1/password_shares",
             params: { password_id: password.id, email: user2.email },
             headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { PasswordShare.count }.by(1)
      
      expect(response).to have_http_status(:created)
    end

    it "prevents sharing with yourself" do
      post "/api/v1/password_shares",
           params: { password_id: password.id, email: user1.email },
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /api/v1/password_shares/:id" do
    it "deletes a password share" do
      share = PasswordShare.create!(
        password: password,
        shared_by: user1,
        shared_with: user2
      )
      
      expect {
        delete "/api/v1/password_shares/#{share.id}",
               headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { PasswordShare.count }.by(-1)
      
      expect(response).to have_http_status(:no_content)
    end
  end
end

