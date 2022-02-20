class Document < ApplicationRecord
  belongs_to :account
  before_save :check_filename_presence

  # IMPORTANT, COMMENTED TO MAKE THE TESTING EASIER, UNCOMMENT TO TEST WITH S3
  # before_destroy :delete_content

  def download_url(public = false)
    public ? s3_obj.public_url : presigned_download_url
  end

  def presigned_download_url
    s3_obj.presigned_url(:get, expires_in: 3600)
  end

  def region_name
    @region_name = self.bucket_location || 'us-east-1'
    @region_name = 'eu-west-1' if @region_name == 'EU'

    @region_name
  end

  private

  def s3_obj
    ::Aws::S3::Resource.new(region: region_name, credentials: s3_signer_credentials)
                       .bucket(bucket_name)
                       .object(path)
  end

  def s3_signer_credentials
    secrets = ::Rails.application.secrets.aws_s3_signer
    @s3_signer_credentials ||= ::Aws::Credentials.new(
      secrets[:access_key_id],
      secrets[:secret_access_key]
    )
  end

  def check_filename_presence
    !self.filename.to_s.strip.blank?
  end

  def delete_content
    secrets = ::Rails.application.secrets.aws_s3_signer
    s3_client = ::Aws::S3::Client.new(
      region: self.bucket_location,
      access_key_id: secrets[:access_key_id],
      secret_access_key: secrets[:secret_access_key]
    )
    s3_client.delete_object bucket: self.bucket_name, key: self.path
  rescue Exception => e
    Rails.logger.error "Error during S3 file deletion: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
  end
end
