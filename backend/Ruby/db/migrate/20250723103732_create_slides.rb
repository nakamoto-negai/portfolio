class CreateSlides < ActiveRecord::Migration[7.1]
  def change
    create_table :slides do |t|
      t.references :portfolio, null: false, foreign_key: true
      t.string :image_url
      t.integer :page_number

      t.timestamps
    end
  end
end
