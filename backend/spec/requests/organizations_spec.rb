require 'rails_helper'

RSpec.describe "Organizations API", type: :request do
  describe "GET /api/v1/organizations" do
    it "returns all organizations" do
      org1 = create(:organization)
      org2 = create(:organization)
      
      get "/api/v1/organizations"
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end
  end
  
  describe "GET /api/v1/organizations/:id" do
    it "returns a specific organization" do
      org = create(:organization, name: "Test Org")
      
      get "/api/v1/organizations/#{org.id}"
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Test Org")
    end
  end
  
  describe "POST /api/v1/organizations" do
    it "creates a new organization" do
      expect {
        post "/api/v1/organizations", params: { organization: { name: "New Org" } }
      }.to change { Organization.count }.by(1)
      
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("New Org")
    end
    
    it "returns errors for invalid organization" do
      post "/api/v1/organizations", params: { organization: { name: "" } }
      
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
  
  describe "PUT /api/v1/organizations/:id" do
    it "updates an organization" do
      org = create(:organization, name: "Old Name")
      
      put "/api/v1/organizations/#{org.id}", params: { organization: { name: "New Name" } }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("New Name")
      expect(org.reload.name).to eq("New Name")
    end
  end
  
  describe "DELETE /api/v1/organizations/:id" do
    it "deletes an organization" do
      org = create(:organization)
      
      expect {
        delete "/api/v1/organizations/#{org.id}"
      }.to change { Organization.count }.by(-1)
      
      expect(response).to have_http_status(:no_content)
    end
  end
end

