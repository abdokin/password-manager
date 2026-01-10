class CreateInvoices < ActiveRecord::Migration[8.1]
  def change
    create_table :invoices do |t|
      t.references :organization, null: false, foreign_key: true
      t.string :invoice_number, null: false
      t.decimal :amount, null: false, precision: 10, scale: 2
      t.string :currency, null: false, default: 'USD'
      t.string :status, null: false, default: 'draft'
      t.date :issue_date
      t.date :due_date
      t.datetime :paid_at
      t.text :items
      t.text :notes
      t.timestamps
    end
    add_index :invoices, :invoice_number, unique: true
    add_index :invoices, [:organization_id, :status]
  end
end

