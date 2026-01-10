class CreateEnvironmentVariables < ActiveRecord::Migration[8.1]
  def change
    create_table :environment_variables do |t|
      t.references :environment, null: false, foreign_key: true
      t.string :key, null: false
      t.text :value, null: false
      t.boolean :encrypted, default: false
      t.text :description
      t.timestamps
    end
    add_index :environment_variables, [:environment_id, :key], unique: true
  end
end

