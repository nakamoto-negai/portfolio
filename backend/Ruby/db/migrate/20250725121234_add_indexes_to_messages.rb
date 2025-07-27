class AddIndexesToMessages < ActiveRecord::Migration[7.1]
  def change
    add_index :messages, [:sender_id, :receiver_id, :created_at]
    add_index :messages, [:receiver_id, :read_at]

    add_check_constraint :messages, 'sender_id <> receiver_id', name: 'sender_receiver_diff'
    add_check_constraint :messages, 'char_length(content) <= 1000', name: 'content_len'
  end
end
