class CreateFeatureFlags < ActiveRecord::Migration[8.1]
  def change
    create_table :feature_flags do |t|
      t.string :key, null: false
      t.string :name, null: false
      t.text :description
      t.string :status, null: false, default: 'disabled'
      t.string :category
      t.json :metadata
      t.timestamps
    end
    add_index :feature_flags, :key, unique: true
    add_index :feature_flags, :status
    add_index :feature_flags, :category
  end
end

