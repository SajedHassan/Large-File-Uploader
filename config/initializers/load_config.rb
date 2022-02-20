APP_CONFIG = YAML.load_file(::Rails.root.to_s + '/config/config.yml')
APP_CONFIG['settings']['aws_s3'] = YAML.load_file(::Rails.root.to_s + '/config/aws_s3.yml')[Rails.env.to_s]
APP_CONFIG.freeze
