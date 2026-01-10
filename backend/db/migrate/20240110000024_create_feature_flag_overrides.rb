class CreateFeatureFlagOverrides < ActiveRecord::Migration[8.1]
  def change
    create_table :feature_flag_overrides do |t|
      t.references :feature_flag, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true
      t.references :organization, null: true, foreign_key: true
      t.boolean :enabled, null: false, default: true
      t.timestamps
    end
    add_index :feature_flag_overrides, [:feature_flag_id, :user_id], unique: true, where: "user_id IS NOT NULL"
    add_index :feature_flag_overrides, [:feature_flag_id, :organization_id], unique: true, where: "organization_id IS NOT NULL"
  end
end

