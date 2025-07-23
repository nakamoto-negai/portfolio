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

ActiveRecord::Schema[7.1].define(version: 2025_07_23_000002) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "portfolios", force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.boolean "is_public", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_portfolios_on_created_at"
    t.index ["is_public"], name: "index_portfolios_on_is_public"
  end

  create_table "slides", force: :cascade do |t|
    t.bigint "portfolio_id", null: false
    t.string "image_url", null: false
    t.integer "page_number", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["page_number"], name: "index_slides_on_page_number"
    t.index ["portfolio_id", "page_number"], name: "index_slides_on_portfolio_id_and_page_number", unique: true
    t.index ["portfolio_id"], name: "index_slides_on_portfolio_id"
  end

  add_foreign_key "slides", "portfolios"
end
