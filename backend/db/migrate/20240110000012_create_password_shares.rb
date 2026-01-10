class CreatePasswordShares < ActiveRecord::Migration[8.1]
  def change
    create_table :password_shares do |t|
      t.references :password, null: false, foreign_key: true
      t.references :shared_by, null: false, foreign_key: { to_table: :users }
      t.references :shared_with, null: false, foreign_key: { to_table: :users }
      t.boolean :can_edit, default: false
      t.timestamps
    end
    add_index :password_shares, [:password_id, :shared_with_id], unique: true
  end
end

