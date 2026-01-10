# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2024_01_10_000022) do
  create_table "activity_logs", force: :cascade do |t|
    t.string "action", null: false
    t.datetime "created_at", null: false
    t.text "details"
    t.string "ip_address"
    t.integer "organization_id"
    t.integer "resource_id"
    t.string "resource_type"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.integer "user_id"
    t.index ["organization_id", "created_at"], name: "index_activity_logs_on_organization_id_and_created_at"
    t.index ["organization_id"], name: "index_activity_logs_on_organization_id"
    t.index ["user_id", "created_at"], name: "index_activity_logs_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_activity_logs_on_user_id"
  end

  create_table "api_keys", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at"
    t.string "key", null: false
    t.string "name", null: false
    t.integer "organization_id"
    t.text "permissions"
    t.datetime "revoked_at"
    t.string "secret", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["key"], name: "index_api_keys_on_key", unique: true
    t.index ["organization_id"], name: "index_api_keys_on_organization_id"
    t.index ["user_id", "revoked_at"], name: "index_api_keys_on_user_id_and_revoked_at"
    t.index ["user_id"], name: "index_api_keys_on_user_id"
  end

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "organization_id", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_categories_on_organization_id"
  end

  create_table "environment_accesses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "environment_id", null: false
    t.string "role", default: "viewer", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["environment_id", "user_id"], name: "index_environment_accesses_on_environment_id_and_user_id", unique: true
    t.index ["environment_id"], name: "index_environment_accesses_on_environment_id"
    t.index ["role"], name: "index_environment_accesses_on_role"
    t.index ["user_id"], name: "index_environment_accesses_on_user_id"
  end

  create_table "environment_variables", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "encrypted", default: false
    t.integer "environment_id", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.text "value", null: false
    t.index ["environment_id", "key"], name: "index_environment_variables_on_environment_id_and_key", unique: true
    t.index ["environment_id"], name: "index_environment_variables_on_environment_id"
  end

  create_table "environments", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "environment_type", null: false
    t.string "name", null: false
    t.integer "organization_id", null: false
    t.datetime "updated_at", null: false
    t.index ["environment_type"], name: "index_environments_on_environment_type"
    t.index ["organization_id", "name"], name: "index_environments_on_organization_id_and_name", unique: true
    t.index ["organization_id"], name: "index_environments_on_organization_id"
  end

  create_table "invoices", force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.string "currency", default: "USD", null: false
    t.date "due_date"
    t.string "invoice_number", null: false
    t.date "issue_date"
    t.text "items"
    t.text "notes"
    t.integer "organization_id", null: false
    t.datetime "paid_at"
    t.string "status", default: "draft", null: false
    t.datetime "updated_at", null: false
    t.index ["invoice_number"], name: "index_invoices_on_invoice_number", unique: true
    t.index ["organization_id", "status"], name: "index_invoices_on_organization_id_and_status"
    t.index ["organization_id"], name: "index_invoices_on_organization_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.string "action_url"
    t.datetime "created_at", null: false
    t.text "message"
    t.string "notification_type", null: false
    t.integer "organization_id"
    t.datetime "read_at"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["organization_id", "created_at"], name: "index_notifications_on_organization_id_and_created_at"
    t.index ["organization_id"], name: "index_notifications_on_organization_id"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "organization_members", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "organization_id", null: false
    t.string "role", default: "member"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["organization_id"], name: "index_organization_members_on_organization_id"
    t.index ["role"], name: "index_organization_members_on_role"
    t.index ["user_id"], name: "index_organization_members_on_user_id"
  end

  create_table "organizations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.string "payment_customer_id"
    t.string "payment_provider", default: "mock"
    t.datetime "updated_at", null: false
  end

  create_table "password_shares", force: :cascade do |t|
    t.boolean "can_edit", default: false
    t.datetime "created_at", null: false
    t.integer "password_id", null: false
    t.integer "shared_by_id", null: false
    t.integer "shared_with_id", null: false
    t.datetime "updated_at", null: false
    t.index ["password_id", "shared_with_id"], name: "index_password_shares_on_password_id_and_shared_with_id", unique: true
    t.index ["password_id"], name: "index_password_shares_on_password_id"
    t.index ["shared_by_id"], name: "index_password_shares_on_shared_by_id"
    t.index ["shared_with_id"], name: "index_password_shares_on_shared_with_id"
  end

  create_table "password_tags", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "password_id", null: false
    t.integer "tag_id", null: false
    t.datetime "updated_at", null: false
    t.index ["password_id"], name: "index_password_tags_on_password_id"
    t.index ["tag_id"], name: "index_password_tags_on_tag_id"
  end

  create_table "passwords", force: :cascade do |t|
    t.integer "category_id"
    t.datetime "created_at", null: false
    t.datetime "expires_at"
    t.boolean "favorite", default: false
    t.boolean "is_breached", default: false
    t.boolean "is_duplicate", default: false
    t.boolean "is_weak", default: false
    t.datetime "last_checked_at"
    t.datetime "last_used_at"
    t.string "name", null: false
    t.text "notes"
    t.integer "organization_id", null: false
    t.text "password", null: false
    t.string "slug", null: false
    t.integer "strength_score", default: 0
    t.datetime "updated_at", null: false
    t.string "url"
    t.integer "user_id", null: false
    t.string "username", null: false
    t.index ["category_id"], name: "index_passwords_on_category_id"
    t.index ["organization_id"], name: "index_passwords_on_organization_id"
    t.index ["slug", "organization_id"], name: "index_passwords_on_slug_and_organization_id", unique: true
    t.index ["user_id"], name: "index_passwords_on_user_id"
  end

  create_table "payments", force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.string "currency", default: "USD", null: false
    t.datetime "failed_at"
    t.text "metadata"
    t.integer "organization_id", null: false
    t.string "payment_provider", null: false
    t.string "provider_payment_id"
    t.string "provider_subscription_id"
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_payments_on_organization_id"
    t.index ["provider_payment_id"], name: "index_payments_on_provider_payment_id"
    t.index ["status"], name: "index_payments_on_status"
  end

  create_table "subscriptions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "ends_at"
    t.integer "organization_id", null: false
    t.string "plan", default: "free", null: false
    t.datetime "starts_at"
    t.string "status", default: "active", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_subscriptions_on_organization_id"
  end

  create_table "tags", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "organization_id", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_tags_on_organization_id"
  end

  create_table "user_settings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.text "value"
    t.index ["user_id", "key"], name: "index_user_settings_on_user_id_and_key", unique: true
    t.index ["user_id"], name: "index_user_settings_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email"
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "verification_tokens", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "token", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["token"], name: "index_verification_tokens_on_token", unique: true
    t.index ["user_id"], name: "index_verification_tokens_on_user_id"
  end

  create_table "versions", force: :cascade do |t|
    t.datetime "created_at"
    t.string "event", null: false
    t.bigint "item_id", null: false
    t.string "item_type", null: false
    t.text "object"
    t.text "object_changes"
    t.string "whodunnit"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  add_foreign_key "activity_logs", "organizations"
  add_foreign_key "activity_logs", "users"
  add_foreign_key "api_keys", "organizations"
  add_foreign_key "api_keys", "users"
  add_foreign_key "categories", "organizations"
  add_foreign_key "environment_accesses", "environments"
  add_foreign_key "environment_accesses", "users"
  add_foreign_key "environment_variables", "environments"
  add_foreign_key "environments", "organizations"
  add_foreign_key "invoices", "organizations"
  add_foreign_key "notifications", "organizations"
  add_foreign_key "notifications", "users"
  add_foreign_key "organization_members", "organizations"
  add_foreign_key "organization_members", "users"
  add_foreign_key "password_shares", "passwords"
  add_foreign_key "password_shares", "users", column: "shared_by_id"
  add_foreign_key "password_shares", "users", column: "shared_with_id"
  add_foreign_key "password_tags", "passwords"
  add_foreign_key "password_tags", "tags"
  add_foreign_key "passwords", "categories"
  add_foreign_key "passwords", "organizations"
  add_foreign_key "passwords", "users"
  add_foreign_key "payments", "organizations"
  add_foreign_key "subscriptions", "organizations"
  add_foreign_key "tags", "organizations"
  add_foreign_key "user_settings", "users"
  add_foreign_key "verification_tokens", "users"
end
