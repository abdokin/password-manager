class CreateActivityLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :activity_logs do |t|
      t.references :user, null: true, foreign_key: true
      t.references :organization, null: true, foreign_key: true
      t.string :action, null: false
      t.string :resource_type
      t.integer :resource_id
      t.text :details
      t.string :ip_address
      t.string :user_agent
      t.timestamps
    end
    add_index :activity_logs, [:organization_id, :created_at]
    add_index :activity_logs, [:user_id, :created_at]
  end
end

