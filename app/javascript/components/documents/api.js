const api = require('../../utils/api')
const axios = require ('axios')

const axiosS3 = axios.create({ headers: { 'Content-Type': 'multipart/form-data' } })

class Api {
  loadDocuments(params) {
    return api.get('/api/v1/documents', params);
  }

  prepareUpload(fileNames) {
    return api.post('/api/v1/documents/prepare', { files: fileNames });
  }

  deleteDocument(id) {
    return api.delete(`/api/v1/documents/${id}`, {});
  }

  newUpload(data) {
    return api.post("/api/v1/documents/new_upload", {
      name: data.name,
      size: data.size,
      key: data.key
    })
  }

  uploadFileS3(s3Form, s3Key, file, callbacks) {
    let formData = new FormData();
    for (let field in s3Form.fields) {
      let value = s3Form.fields[field];
      if (field === 'key') {
        value = s3Key;
      }
      formData.append(field, value);
    }
    formData.append('Filename', file.name);
    formData.append('file', file);
    return axiosS3({
      method: 'post',
      url: s3Form.url,
      data: formData,
      onUploadProgress: function(event) {
        if (!(event.lengthComputable || callbacks.onProgress)) return
        let percentCompleted = parseInt(event.loaded / event.total * 100);
        return callbacks.onProgress({
          progress: percentCompleted
        });
      },
      cancelToken: new axios.CancelToken(function(cancelFunc) {
        if (callbacks.sendAbortFunction) {
          return callbacks.sendAbortFunction(cancelFunc);
        }
      })
    });
  }
}

module.exports = new Api
