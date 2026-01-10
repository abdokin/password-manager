require 'rails_helper'

RSpec.describe "Audit API", type: :request do
  describe "GET /api/v1/organizations/:id/audit" do
    let(:organization) { create(:organization) }
    let(:user) { create(:user) }
    
    it "returns audit summary" do
      create(:password, organization: organization, user: user, is_breached: true)
      create(:password, organization: organization, user: user, is_weak: true)
      create(:password, organization: organization, user: user, is_duplicate: true)
      
      get "/api/v1/organizations/#{organization.id}/audit"
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["summary"]["total"]).to eq(3)
      expect(json["summary"]["breached"]).to eq(1)
      expect(json["summary"]["weak"]).to eq(1)
      expect(json["summary"]["duplicates"]).to eq(1)
      expect(json["summary"]["security_score"]).to be_present
    end
    
    it "returns empty audit for organization with no passwords" do
      get "/api/v1/organizations/#{organization.id}/audit"
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["summary"]["total"]).to eq(0)
      expect(json["summary"]["security_score"]).to eq(100)
    end
  end
end

