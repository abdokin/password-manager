class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :organization, null: true, foreign_key: true
      t.string :title, null: false
      t.text :message
      t.string :notification_type, null: false
      t.string :action_url
      t.datetime :read_at
      t.timestamps
    end
    add_index :notifications, [:user_id, :read_at]
    add_index :notifications, [:organization_id, :created_at]
  end
end


