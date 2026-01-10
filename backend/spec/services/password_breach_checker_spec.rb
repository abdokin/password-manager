require "rails_helper"

RSpec.describe PasswordBreachChecker do
  describe ".check" do
    it "returns false for blank password" do
      expect(PasswordBreachChecker.check("")).to be_falsey
      expect(PasswordBreachChecker.check(nil)).to be_falsey
    end

    it "returns boolean for valid password" do
      result = PasswordBreachChecker.check("testpassword123")
      expect([true, false]).to include(result)
    end
  end
end

