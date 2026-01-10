require 'rails_helper'

RSpec.describe "Categories API", type: :request do
  let(:organization) { create(:organization) }
  
  describe "GET /api/v1/organizations/:organization_id/categories" do
    it "returns categories for organization" do
      cat1 = create(:category, organization: organization)
      cat2 = create(:category, organization: organization)
      other_org = create(:organization)
      create(:category, organization: other_org)
      
      get "/api/v1/organizations/#{organization.id}/categories"
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
      expect(json.map { |c| c["id"] }).to contain_exactly(cat1.id, cat2.id)
    end
  end
  
  describe "POST /api/v1/organizations/:organization_id/categories" do
    it "creates a new category" do
      expect {
        post "/api/v1/organizations/#{organization.id}/categories",
             params: { category: { name: "Work" } }
      }.to change { Category.count }.by(1)
      
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Work")
      expect(json["organization_id"]).to eq(organization.id)
    end
  end
  
  describe "PUT /api/v1/organizations/:organization_id/categories/:id" do
    it "updates a category" do
      category = create(:category, organization: organization, name: "Old")
      
      put "/api/v1/organizations/#{organization.id}/categories/#{category.id}",
          params: { category: { name: "New" } }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("New")
    end
  end
  
  describe "DELETE /api/v1/organizations/:organization_id/categories/:id" do
    it "deletes a category" do
      category = create(:category, organization: organization)
      
      expect {
        delete "/api/v1/organizations/#{organization.id}/categories/#{category.id}"
      }.to change { Category.count }.by(-1)
      
      expect(response).to have_http_status(:no_content)
    end
  end
end

