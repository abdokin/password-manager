require "rails_helper"

RSpec.describe "Passwords API", type: :request do
  let(:user) { create(:user) }
  let(:organization) { create(:organization) }
  let(:valid_attributes) do
    {
      name: "Test Site",
      username: "testuser",
      password: "testpass123",
      user_id: user.id,
      organization_id: organization.id
    }
  end

  describe "GET /api/v1/passwords" do
    it "returns a list of passwords" do
      create(:password, user: user, organization: organization)
      get "/api/v1/passwords"
      expect(response).to have_http_status(:success)
      expect(JSON.parse(response.body)).to be_an(Array)
    end
  end

  describe "POST /api/v1/passwords" do
    it "creates a new password" do
      expect {
        post "/api/v1/passwords", params: { password: valid_attributes }
      }.to change(Password, :count).by(1)
      expect(response).to have_http_status(:created)
    end
  end

  describe "GET /api/v1/passwords/:id" do
    it "returns a password" do
      password = create(:password, user: user, organization: organization)
      get "/api/v1/passwords/#{password.id}"
      expect(response).to have_http_status(:success)
      expect(JSON.parse(response.body)["id"]).to eq(password.id)
    end
  end

  describe "PUT /api/v1/passwords/:id" do
    it "updates a password" do
      password = create(:password, user: user, organization: organization)
      put "/api/v1/passwords/#{password.id}", params: { password: { name: "Updated Name" } }
      expect(response).to have_http_status(:success)
      expect(password.reload.name).to eq("Updated Name")
    end
  end

  describe "DELETE /api/v1/passwords/:id" do
    it "deletes a password" do
      password = create(:password, user: user, organization: organization)
      expect {
        delete "/api/v1/passwords/#{password.id}"
      }.to change(Password, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end

  describe "POST /api/v1/passwords/:id/toggle_favorite" do
    it "toggles favorite status" do
      password = create(:password, user: user, organization: organization, favorite: false)
      post "/api/v1/passwords/#{password.id}/toggle_favorite"
      expect(response).to have_http_status(:success)
      expect(password.reload.favorite).to be_truthy
    end
  end
end

