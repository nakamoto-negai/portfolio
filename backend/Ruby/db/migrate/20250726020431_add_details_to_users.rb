class AddDetailsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :skill, :string
    add_column :users, :experience, :text
    add_column :users, :github_url, :string
    add_column :users, :twitter_url, :string
  end
end
