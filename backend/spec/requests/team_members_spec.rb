require 'rails_helper'

RSpec.describe "Team Members API", type: :request do
  let(:organization) { create(:organization) }
  let(:user) { create(:user) }
  let(:other_user) { create(:user, email: "other@example.com") }
  let(:token) { JwtService.encode({ user_id: user.id, email: user.email }) }
  
  before do
    request.headers['Authorization'] = "Bearer #{token}"
  end
  
  describe "GET /api/v1/organizations/:id/team_members" do
    it "returns team members for organization" do
      member = OrganizationMember.create!(organization: organization, user: other_user, role: 'member')
      
      get "/api/v1/organizations/#{organization.id}/team_members",
          headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
    end
  end
  
  describe "POST /api/v1/organizations/:id/team_members" do
    it "adds a team member" do
      expect {
        post "/api/v1/organizations/#{organization.id}/team_members",
             params: { email: other_user.email, role: 'member' },
             headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { OrganizationMember.count }.by(1)
      
      expect(response).to have_http_status(:created)
    end
  end
  
  describe "PUT /api/v1/organizations/:id/team_members/:id" do
    it "updates team member role" do
      member = OrganizationMember.create!(organization: organization, user: other_user, role: 'member')
      
      put "/api/v1/organizations/#{organization.id}/team_members/#{member.id}",
          params: { role: 'admin' },
          headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      expect(member.reload.role).to eq('admin')
    end
  end
end

