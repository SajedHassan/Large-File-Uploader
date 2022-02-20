class CreateDocuments < ActiveRecord::Migration[7.0]
  def change
    create_table :documents do |t|
      t.string :bucket_name
      t.string :bucket_location
      t.string :filename
      t.string :title
      t.string :description
      t.integer :size
      t.string :path
      t.string :mime_type
      t.timestamp :deleted_at
      t.references :account, null: false, foreign_key: true

      t.timestamps
    end
  end
end
