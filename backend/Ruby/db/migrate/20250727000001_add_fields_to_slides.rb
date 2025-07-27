class AddFieldsToSlides < ActiveRecord::Migration[7.1]
  def change
    add_column :slides, :title, :string
    add_column :slides, :content, :text
    add_column :slides, :order_index, :integer
    add_column :slides, :slide_type, :string
    add_column :slides, :background_color, :string
    
    # インデックスを追加
    add_index :slides, :order_index
    add_index :slides, :slide_type
  end
end