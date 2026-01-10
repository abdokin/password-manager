require "rails_helper"

RSpec.describe Password, type: :model do
  let(:user) { create(:user) }
  let(:organization) { create(:organization) }
  let(:password) { build(:password, user: user, organization: organization) }

  describe "validations" do
    it "is valid with valid attributes" do
      expect(password).to be_valid
    end

    it "is invalid without a name" do
      password.name = nil
      expect(password).not_to be_valid
    end

    it "is invalid without a username" do
      password.username = nil
      expect(password).not_to be_valid
    end

    it "is invalid without a password" do
      password.password = nil
      expect(password).not_to be_valid
    end
  end

  describe "slug generation" do
    it "generates slug from name" do
      password.name = "My Test Site"
      password.slug = nil
      password.valid?
      expect(password.slug).to eq("my-test-site")
    end
  end

  describe "#toggle_favorite!" do
    it "toggles favorite status" do
      expect(password.favorite).to be_falsey
      password.save!
      password.toggle_favorite!
      expect(password.reload.favorite).to be_truthy
    end
  end

  describe "#calculate_strength" do
    it "calculates strength for strong password" do
      password.password = "StrongP@ssw0rd123"
      expect(password.calculate_strength).to be > 60
    end

    it "calculates strength for weak password" do
      password.password = "123"
      expect(password.calculate_strength).to be < 40
    end
  end
end
