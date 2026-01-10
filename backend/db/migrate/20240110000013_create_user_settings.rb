class CreateUserSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :user_settings do |t|
      t.references :user, null: false, foreign_key: true
      t.string :key, null: false
      t.text :value
      t.timestamps
    end
    add_index :user_settings, [:user_id, :key], unique: true
  end
end

