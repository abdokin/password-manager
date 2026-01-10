class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments do |t|
      t.references :organization, null: false, foreign_key: true
      t.decimal :amount, null: false, precision: 10, scale: 2
      t.string :currency, null: false, default: 'USD'
      t.string :status, null: false, default: 'pending'
      t.string :payment_provider, null: false
      t.string :provider_payment_id
      t.string :provider_subscription_id
      t.text :metadata
      t.datetime :completed_at
      t.datetime :failed_at
      t.timestamps
    end
    add_index :payments, :status
    add_index :payments, :provider_payment_id
  end
end

