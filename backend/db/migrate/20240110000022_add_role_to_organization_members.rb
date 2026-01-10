class AddRoleToOrganizationMembers < ActiveRecord::Migration[8.1]
  def change
    add_column :organization_members, :role, :string, default: 'member'
    add_index :organization_members, :role
  end
end


