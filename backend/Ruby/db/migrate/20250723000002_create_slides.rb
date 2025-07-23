class CreateSlides < ActiveRecord::Migration[7.1]
  def change
    create_table :slides do |t|
      t.references :portfolio, null: false, foreign_key: true
      t.string :image_url, null: false
      t.integer :page_number, null: false
      
      t.timestamps
    end
    
    add_index :slides, [:portfolio_id, :page_number], unique: true
    add_index :slides, :page_number
  end
end
