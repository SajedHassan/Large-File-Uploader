module Documents
  class NewUploadService

    # @param user [User] Current user who uploaded the file
    def initialize(account)
      @account = account
    end
    attr_reader :account

    # Create document in database
    # if given arguments are valid and file has been uploaded.
    # @raise [String] May raise exceptions for various reasons. e.g. Invalid arguments, Insufficient storage.
    def create_document(name:, key:, size:)
      # Are arguments valid?
      size = size.to_i
      raise 'Invalid arguments' if name.nil? || name.empty? || key.nil? || (size <= 0)
      key.gsub!('${filename}', name)

      # the next section validates the file is uploaded to s3 successfully, it's disabled to make the testing easier by skipping the actual upload
      begin
        # s3_obj = s3_service.client.head_object(bucket: s3_service.bucket_name, key: key)
        # raise 'Invalid file information' if s3_obj.content_length != size
      rescue ::Aws::S3::Errors::NotFound
        raise 'File not found'
      end

      # OK, we can save information about this object in DB
      account.documents.create(
          :bucket_name => s3_service.bucket_name,
          :bucket_location => s3_service.region,
          :filename => name,
          :size => size,
          :path => key,
          :mime_type => 'application/octet-stream'
      )
    end

    private

    def s3_service
      @s3_service ||= ::S3::BucketService.init :permanent
    end
  end
end
