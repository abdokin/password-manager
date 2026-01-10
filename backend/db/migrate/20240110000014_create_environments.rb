class CreateEnvironments < ActiveRecord::Migration[8.1]
  def change
    create_table :environments do |t|
      t.string :name, null: false
      t.string :environment_type, null: false
      t.text :description
      t.references :organization, null: false, foreign_key: true
      t.timestamps
    end
    add_index :environments, [:organization_id, :name], unique: true
    add_index :environments, :environment_type
  end
end

