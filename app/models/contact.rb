class Contact < ActiveRecord::Base
  # attr_accessible :title, :body
  belongs_to :user

  after_initialize :my_callback, :unless => :persisted?
  after_save :after_save_on_create, :on => :create

  def my_callback
    puts '----------------------------'
    puts 'after initialize'
    puts '----------------------------'
  end

  def after_save_on_create
    puts '----------------------------'
    puts 'after save on create if true'
    puts '----------------------------'
  end

  def ololo
    12.333333
  end

  def as_json(options = {})
    super(options.merge(:except => [:id]).merge(:methods => [:ololo]).merge(:include => [:user]))
  end
end
