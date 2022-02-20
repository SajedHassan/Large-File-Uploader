# README

This is a simple file uploader that allows the users to upload files with sizes up to 1 GB per each file, also it give the user the ability to login to access his uploaded files privately besides the ability to generate public URLs to share the files with public users.

This project is implemented using the following stacks:

1) Rails: Backend
2) React, Reflux: Frontend
3) PostgreSQL: Database for the AUTH system, the metadata for the files, and the relation between them
4) AWS S3 (Localstak): to store the uploaded files itself

Prerequisite:
> ruby 3.0.0p0 // you need at least version 3 here
>
> Bundler version 2.2.11
> 
> NPM 8.3.0 // you need at least version 7.1 here
> 
> YARN 1.22.10
> 
> psql (PostgreSQL) 13.1 // let's use a production-ready database locally
> 
> Rails 7

To test it with AWS S3 you will a need to install LocalStack, the free AWS cloud compatible version for testing.
To install LocalStack, the following are needed:

> python (Python 3.6 up to 3.9 is supported)
>
> pip (Python package manager)
>
> docker

For more info on how to install and run LocalStack locally please visit: https://docs.localstack.cloud/get-started/#localstack-cli

To install localstack: `python3 -m pip install localstack`
Then Start it with: `localstack start`, please notice: it will take several minutes in the very first run.

You can also test without installing localstack because the code that's responsible of uploading and deleting the large chunks is commented, so you can check the metadata is being saved correctly on both Psql and AWS S3 but if you want to have the full functionality tested then you will need to uncomment the
`before_destroy` hook in the documents model and the `uploadFileS3` method from the Reflux actions, and also make sure that you create a bucket on Localstack with the name `default-bucket` in `us-west-1` region like following:
ssh to the cli: `localstack ssh` then
```
aws s3api create-bucket \
    --bucket default-bucket \
    --region eu-west-1 \
    --create-bucket-configuration LocationConstraint=eu-west-1
```
and it's better not to force any constrains on it (just for testing of course XD)

You will also need to set the region to us-west-1 by following those steps:
after SSHing to the CLI:
```
aws configure
```
then follow the steps (it should be 4 steps)

One last thing is to make sure you disabled the CSRF CORG at the localstack side by providing the following env variable while running it:
`DISABLE_CORS_CHECKS=TRUE` so you can run it likw following (unless you prefer to run it manually using docker compose):
```
SERVICES="s3" DEFAULT_REGION=“us-west-1” AWS_ACCESS_KEY_ID="DUMMY" AWS_SECRET_ACCESS_KEY="DUMMY" EXTRA_CORS_ALLOWED_ORIGINS="*" DISABLE_CORS_CHECKS=1 localstack start
```

Please feel free to reach out to me to discuss anything regarding the repo.
Sajed Almorsy