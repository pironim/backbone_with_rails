class AddTelToContact < ActiveRecord::Migration
  def change
    add_column :contacts, :tel, :string
    add_column :contacts, :tel2, :string
  end
end
