# app/serializers/message_serializer.rb
class MessageSerializer < ActiveModel::Serializer
  attributes :id, :content, :created_at, :read_at,
             :sender_id, :receiver_id
end