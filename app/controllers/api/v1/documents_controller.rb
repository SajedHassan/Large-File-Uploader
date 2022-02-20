class Api::V1::DocumentsController < Api::V1::ApiController
  def index
    render json: current_account.documents.map{|document| DocumentSerializer.serialize(document)}
  end

  def prepare
    s3_form_service = ::Documents::S3FormService.new(current_account)
    ascii_names = {}
    create_file_names_params[:files].to_h.each_value do |file|
      ascii_names[file[:uuid]] = file[:name].to_s.to_ascii unless file[:name].to_s.ascii_only?
    end

    # Permissions for viewing file to private by default
    render json: {
      formData: s3_form_service.s3_form(current_account.id),
      asciiNames: ascii_names
    }
  end

  def new_upload
    new_upload_service = ::Documents::NewUploadService.new(current_account)

    document = new_upload_service.create_document(
      name: new_upload_params[:name],
      key: new_upload_params[:key],
      size: new_upload_params[:size]
    )
    render json: { document: DocumentSerializer.serialize(document) }

  rescue => e # NewUploadService may raise exception for various reasons
    return render :json => { status: :error, message: e.message }, status: 422
  end

  def destroy
    document.destroy
    render json: { status: :ok }, status: 200
  end

  private

  def document
    @document ||= begin
                      raise IdError.new(Document, nil) unless document_id.present?

                      document = current_account.documents.find(document_id)
                      raise IdError.new(Document, document_id) if document.nil?
                      document
                    end
  end

  def document_id
    @document_id ||= document_id_param[:id]
  end

  def document_id_param
    params.permit(:id)
  end

  def new_upload_params
    @new_upload_params_hash ||= params.permit(:name, :size, :key).to_h.symbolize_keys
  end

  def create_file_names_params
    @file_names_params ||= params.permit(files: [:uuid, :name])
  end
end
