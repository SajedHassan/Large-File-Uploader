# frozen_string_literal: true

module S3
  class BucketService
    TYPES = %i[permanent upload open].freeze
    AWS_S3_SETTINGS = APP_CONFIG['settings']['aws_s3']

    # Initialize bucket service using type and region from list of existing buckets
    # @param type [String, Symbol] type of bucket
    # @param region [String] aws s3 region
    # @return [::S3::BucketService] Return initialized bucket service
    def self.init(type, region=AWS_S3_SETTINGS['regions']['default'])
      return ::S3::OldUploadBucketService.init(:upload, region) if type.to_sym == :old_upload

      new(get_bucket_name(type, region))
    end

    # Get bucket hash
    # @return [Hash{String => Hash}] Return buckets
    def self.buckets
      AWS_S3_SETTINGS['buckets']
    end

    # @!attribute [r] bucket name
    # @return [String]
    attr_reader :bucket_name

    # @!attribute [r] bucket type
    # @return [Symbol]
    attr_reader :type

    # @!attribute [r] bucket region
    # @return [String]
    attr_reader :region

    # Get bucket name using type and region from list of existing buckets
    # @param type [String, Symbol] type of bucket
    # @param region [String] aws s3 region
    # @return [String, nil] Return bucket name or nil
    def self.get_bucket_name(type, region)
      type = type.to_s
      region = region.to_s
      buckets.detect { |_, bucket| bucket['type'] == type && bucket['region'] == region }&.first
    end
    private_class_method :get_bucket_name

    # Constructor
    # @param name [String] Existing bucket name
    def initialize(name)
      bucket_data = self.class.buckets[name.to_s]
      raise "S3 Bucket doesn't exists #{name}" unless bucket_data.present?

      @bucket_name = name
      @type = bucket_data['type'].to_sym
      @region = bucket_data['region']
    end

    # Base url for bucket. Could be used in upload or any other cases.
    # @return [String] Return base url for bucket
    def base_url
      aws_s3_bucket.url + '/'
    end
    alias upload_url base_url

    # @return [::Aws::S3::Bucket] return instance of Aws S3 Bucket resource
    def aws_s3_bucket
      secrets = ::Rails.application.secrets.aws_s3_signer
      @aws_s3_bucket ||= ::Aws::S3::Resource.new(region: region, access_key_id: secrets[:access_key_id], secret_access_key: secrets[:secret_access_key]).bucket(bucket_name)
    end
  end
end
