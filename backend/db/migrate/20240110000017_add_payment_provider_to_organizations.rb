class AddPaymentProviderToOrganizations < ActiveRecord::Migration[8.1]
  def change
    add_column :organizations, :payment_provider, :string, default: 'mock'
    add_column :organizations, :payment_customer_id, :string
  end
end

