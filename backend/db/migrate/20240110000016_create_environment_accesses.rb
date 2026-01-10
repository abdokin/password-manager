class CreateEnvironmentAccesses < ActiveRecord::Migration[8.1]
  def change
    create_table :environment_accesses do |t|
      t.references :environment, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :role, null: false, default: 'viewer'
      t.timestamps
    end
    add_index :environment_accesses, [:environment_id, :user_id], unique: true
    add_index :environment_accesses, :role
  end
end

