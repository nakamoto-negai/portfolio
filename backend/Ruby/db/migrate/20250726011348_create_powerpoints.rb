class CreatePowerpoints < ActiveRecord::Migration[7.1]
  def change
    create_table :powerpoints do |t|
      t.references :portfolio, null: false, foreign_key: true
      t.string :filename
      t.string :original_filename
      t.integer :file_size
      t.string :content_type
      t.text :file_path
      t.text :description
      t.boolean :is_generated
      t.datetime :generated_at
      t.json :metadata

      t.timestamps
    end
  end
end
