require 'rails_helper'

RSpec.describe "Tags API", type: :request do
  let(:organization) { create(:organization) }
  
  describe "GET /api/v1/organizations/:organization_id/tags" do
    it "returns tags for organization" do
      tag1 = create(:tag, organization: organization)
      tag2 = create(:tag, organization: organization)
      other_org = create(:organization)
      create(:tag, organization: other_org)
      
      get "/api/v1/organizations/#{organization.id}/tags"
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end
  end
  
  describe "POST /api/v1/organizations/:organization_id/tags" do
    it "creates a new tag" do
      expect {
        post "/api/v1/organizations/#{organization.id}/tags",
             params: { tag: { name: "Important" } }
      }.to change { Tag.count }.by(1)
      
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Important")
    end
  end
end

