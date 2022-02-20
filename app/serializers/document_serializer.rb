class DocumentSerializer < ActiveModel::Serializer

  def self.serialize(object)
    wrapped_obj = new(object)
    {
      id: wrapped_obj.id,
      name: wrapped_obj.name,
      title: wrapped_obj.title,
      description: wrapped_obj.description,
      type: wrapped_obj.type,
      url: wrapped_obj.url,
      public_url: wrapped_obj.public_url,
      size: wrapped_obj.size,
      original_size: wrapped_obj.original_size,
      status: wrapped_obj.status
    }
  end

  def initialize(object)
    @object = object
  end

  attr_accessor :object

  def id
    object.id.to_s
  end

  def name
    object.filename
  end

  def title
    object.title
  end

  def description
    object.description
  end

  def type
    document_type
  end

  def url
    object.download_url
  end

  def public_url
    object.download_url(true)
  end

  def size
    as_filesize(object.size)
  end

  def original_size
    object.size
  end

  def status
    :successful
  end

  private

  def document_type
    # better to check magic bytes here
    File.extname(object.filename).downcase[1..-1]
  end

  def as_filesize(value)
    suffixes = %w{B kB MB GB TB}
    idx = 0
    while idx < 4 && value > 1024
      idx += 1
      value /= 1024
    end

    value.to_s + ' ' + suffixes[idx] # return
  end


end
