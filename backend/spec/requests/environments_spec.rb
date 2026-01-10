require 'rails_helper'

RSpec.describe "Environments API", type: :request do
  let(:organization) { create(:organization) }
  let(:user) { create(:user) }
  let(:token) { JwtService.encode({ user_id: user.id, email: user.email }) }
  
  before do
    request.headers['Authorization'] = "Bearer #{token}"
  end
  
  describe "GET /api/v1/organizations/:organization_id/environments" do
    it "returns environments for organization" do
      env1 = create(:environment, organization: organization)
      env2 = create(:environment, organization: organization, environment_type: "production")
      
      get "/api/v1/organizations/#{organization.id}/environments",
          headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end
    
    it "filters by environment type" do
      create(:environment, organization: organization, environment_type: "development")
      create(:environment, organization: organization, environment_type: "production")
      
      get "/api/v1/organizations/#{organization.id}/environments?type=production",
          headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]["environment_type"]).to eq("production")
    end
  end
  
  describe "POST /api/v1/organizations/:organization_id/environments" do
    it "creates a new environment" do
      expect {
        post "/api/v1/organizations/#{organization.id}/environments",
             params: {
               environment: {
                 name: "Staging",
                 environment_type: "staging",
                 description: "Staging environment"
               }
             },
             headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { Environment.count }.by(1)
      
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Staging")
      expect(EnvironmentAccess.where(environment_id: json["id"], user: user, role: "admin").exists?).to be true
    end
  end
  
  describe "POST /api/v1/organizations/:organization_id/environments/:id/variables" do
    let(:environment) { create(:environment, organization: organization) }
    
    before do
      environment.grant_access(user, role: 'admin')
    end
    
    it "adds a variable to environment" do
      expect {
        post "/api/v1/organizations/#{organization.id}/environments/#{environment.id}/variables",
             params: { key: "API_KEY", value: "secret123", encrypted: false },
             headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { EnvironmentVariable.count }.by(1)
      
      expect(response).to have_http_status(:created)
    end
    
    it "adds an encrypted variable" do
      post "/api/v1/organizations/#{organization.id}/environments/#{environment.id}/variables",
           params: { key: "SECRET", value: "very-secret", encrypted: true },
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:created)
      variable = EnvironmentVariable.last
      expect(variable.encrypted).to be true
      expect(variable.value).not_to eq("very-secret")
    end
  end
  
  describe "GET /api/v1/organizations/:organization_id/environments/:id/variables/:key" do
    let(:environment) { create(:environment, organization: organization) }
    let(:variable) { create(:environment_variable, environment: environment, key: "API_KEY", value: "secret123") }
    
    before do
      environment.grant_access(user, role: 'viewer')
    end
    
    it "returns decrypted variable value" do
      get "/api/v1/organizations/#{organization.id}/environments/#{environment.id}/variables/#{variable.key}",
          headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["value"]).to eq("secret123")
    end
  end
  
  describe "POST /api/v1/organizations/:organization_id/environments/:id/accesses" do
    let(:environment) { create(:environment, organization: organization) }
    let(:other_user) { create(:user, email: "other@example.com") }
    
    before do
      environment.grant_access(user, role: 'admin')
    end
    
    it "grants access to a user" do
      expect {
        post "/api/v1/organizations/#{organization.id}/environments/#{environment.id}/accesses",
             params: { email: other_user.email, role: "editor" },
             headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { EnvironmentAccess.count }.by(1)
      
      expect(response).to have_http_status(:created)
      expect(EnvironmentAccess.last.role).to eq("editor")
    end
  end
end

