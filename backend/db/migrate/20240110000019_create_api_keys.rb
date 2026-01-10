class CreateApiKeys < ActiveRecord::Migration[8.1]
  def change
    create_table :api_keys do |t|
      t.references :user, null: false, foreign_key: true
      t.references :organization, null: true, foreign_key: true
      t.string :name, null: false
      t.string :key, null: false
      t.string :secret, null: false
      t.datetime :expires_at
      t.datetime :revoked_at
      t.text :permissions
      t.timestamps
    end
    add_index :api_keys, :key, unique: true
    add_index :api_keys, [:user_id, :revoked_at]
  end
end

