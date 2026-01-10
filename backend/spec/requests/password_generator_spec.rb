require 'rails_helper'

RSpec.describe "Password Generator API", type: :request do
  describe "POST /api/v1/password_generator" do
    it "generates a password with default settings" do
      post "/api/v1/password_generator"
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["password"]).to be_present
      expect(json["length"]).to eq(16)
    end
    
    it "generates a password with custom length" do
      post "/api/v1/password_generator", params: { length: 20 }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["password"].length).to eq(20)
    end
    
    it "generates password with only lowercase" do
      post "/api/v1/password_generator", params: {
        length: 10,
        include_uppercase: false,
        include_numbers: false,
        include_symbols: false
      }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["password"]).to match(/^[a-z]+$/)
    end
    
    it "generates password with all character types" do
      post "/api/v1/password_generator", params: {
        length: 20,
        include_uppercase: true,
        include_lowercase: true,
        include_numbers: true,
        include_symbols: true
      }
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      password = json["password"]
      expect(password).to match(/[A-Z]/)
      expect(password).to match(/[a-z]/)
      expect(password).to match(/[0-9]/)
      expect(password).to match(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?\/~`]/)
    end
  end
end

