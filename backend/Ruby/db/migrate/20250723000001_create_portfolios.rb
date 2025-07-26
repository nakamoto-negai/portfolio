class CreatePortfolios < ActiveRecord::Migration[7.1]
  def change
    create_table :portfolios do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.boolean :is_public, default: false
      
      t.timestamps
    end
    
    add_index :portfolios, :is_public
    add_index :portfolios, :created_at
  end
end
