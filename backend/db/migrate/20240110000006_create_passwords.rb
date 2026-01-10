class CreatePasswords < ActiveRecord::Migration[8.1]
  def change
    create_table :passwords do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.string :username, null: false
      t.text :password, null: false
      t.string :url
      t.text :notes
      t.boolean :favorite, default: false
      t.datetime :expires_at
      t.integer :strength_score, default: 0
      t.boolean :is_breached, default: false
      t.boolean :is_duplicate, default: false
      t.boolean :is_weak, default: false
      t.datetime :last_used_at
      t.datetime :last_checked_at
      t.references :user, null: false, foreign_key: true
      t.references :organization, null: false, foreign_key: true
      t.references :category, null: true, foreign_key: true
      t.timestamps
    end
    add_index :passwords, [:slug, :organization_id], unique: true
  end
end

