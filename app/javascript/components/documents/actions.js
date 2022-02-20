const Reflux = require('reflux');
const api = require('./api');

// var trackError = ReactUtils.errors.trackError;

const actions = Reflux.createActions([
  {'uploadFileProgress': {}},
  {'uploadFileDrop': {}},
  {'loadDocuments': { asyncResult: true }},
  {'deleteDocument': { asyncResult: true }},
  {'uploadFileS3': { asyncResult: true }},
  {'prepareUpload': { asyncResult: true }},
  {'newUpload': { asyncResult: true }}
]);

actions.prepareUpload.listen(function(fileNames) {
  api.prepareUpload(fileNames)
    .then( this.completed )
    .catch( this.failed );
});

actions.deleteDocument.listen(function(id) {
  api.deleteDocument(id)
      .then( this.completed(id) )
});

actions.newUpload.listen(function(uuid, data) {
  api.newUpload(data)
    .done((result) => this.completed(uuid, result))
    .fail((result) => this.failed(uuid, result))
});

showErrorInConsole = (err) => console.error(err)

actions.uploadFileS3.listen(function(uuid, s3form, s3Key, file, callbacks) {
  let completed = (result) => this.completed(uuid, result)
  let failed = (result) => this.failed(uuid, result)

  completed(uuid, {})
  // skipped for easier testing, to enable actual uploading to s3 uncomment the code below and comment the completed callback above

  // api.uploadFileS3(s3form, s3Key, file, callbacks)
  //   .then(completed, failed)
  //   .catch(showErrorInConsole)
});

actions.loadDocuments.listen(function(params) {
  if (params == null) params = {}
  api.loadDocuments(params)
    .then( this.completed )
    .catch( this.failed );
});

module.exports = actions;