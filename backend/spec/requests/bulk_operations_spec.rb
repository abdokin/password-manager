require 'rails_helper'

RSpec.describe "Bulk Operations API", type: :request do
  let(:user) { create(:user) }
  let(:organization) { create(:organization) }
  let(:token) { JwtService.encode({ user_id: user.id, email: user.email }) }
  let(:password1) { create(:password, user: user, organization: organization) }
  let(:password2) { create(:password, user: user, organization: organization) }

  before do
    request.headers['Authorization'] = "Bearer #{token}"
  end

  describe "POST /api/v1/bulk/delete" do
    it "deletes multiple passwords" do
      expect {
        post "/api/v1/bulk/delete",
             params: { password_ids: [password1.id, password2.id] },
             headers: { 'Authorization' => "Bearer #{token}" }
      }.to change { Password.count }.by(-2)
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["deleted"]).to eq(2)
    end
  end

  describe "POST /api/v1/bulk/toggle_favorite" do
    it "toggles favorite status for multiple passwords" do
      post "/api/v1/bulk/toggle_favorite",
           params: { password_ids: [password1.id, password2.id], favorite: true },
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      expect(password1.reload.favorite).to be true
      expect(password2.reload.favorite).to be true
    end
  end

  describe "POST /api/v1/bulk/move_to_category" do
    let(:category) { create(:category, organization: organization) }

    it "moves multiple passwords to a category" do
      post "/api/v1/bulk/move_to_category",
           params: { password_ids: [password1.id, password2.id], category_id: category.id },
           headers: { 'Authorization' => "Bearer #{token}" }
      
      expect(response).to have_http_status(:success)
      expect(password1.reload.category_id).to eq(category.id)
      expect(password2.reload.category_id).to eq(category.id)
    end
  end
end

