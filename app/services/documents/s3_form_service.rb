module Documents
  class S3FormService

    # @param [User] User whose is uploading to S3
    def initialize(account)
      @account = account
    end

    attr_reader :account

    def s3_form(acl = 'private')
      {
        url: s3_service.upload_url,
        fields: build_s3_form_fields(account.id, acl)
      }
    end

    private

    def s3_service
      @s3_service ||= ::S3::BucketService.init :permanent
    end

    def credentials
      secrets = ::Rails.application.secrets.aws_s3_signer
      @credentials ||= ::Aws::Credentials.new(
        secrets[:access_key_id],
        secrets[:secret_access_key]
      )
    end

    def build_s3_form_fields(account_id, acl = 'private')
      path_prefix_id = account_id.to_s

      fields = Aws::S3::PresignedPost.new(
        credentials,
        s3_service.region,
        s3_service.bucket_name,
        url: s3_service.aws_s3_bucket.url,
        key_starts_with: path_prefix_id,
        acl: acl.to_s,
        success_action_status: '201',
        content_length_range: 0..1.gigabytes,
        allow_any: ['Filename'],
        signature_expiration: (Time.now.utc + 10.hours)
      ).fields

      # We use these values in frontend + API to construct the s3 key
      fields['key'] = ''
      fields['success_action_status'] = 201 # presigned post above requires a string, however we work with integer
      fields['x-ignore-pattern'] = "#{path_prefix_id}/__timestamp__/${filename}"
      fields
    end
  end
end
