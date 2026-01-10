class CreatePasswordTags < ActiveRecord::Migration[8.1]
  def change
    create_table :password_tags do |t|
      t.references :password, null: false, foreign_key: true
      t.references :tag, null: false, foreign_key: true
      t.timestamps
    end
  end
end

