class IdError < BaseError
  def initialize(klass, id = nil, status = nil)
    super()
    @message = "The #{klass.to_s} id is incorrect."
    @code = "#{klass.to_s.custom_downcase}_id_incorrect"
    @id = id.to_s unless id.nil?
    @type = "id_missing"
    @status = status || 404
  end

  def as_json(options = {})
    super(options).tap do |data|
      data[:id] = @id unless @id.nil?
    end
  end
end
