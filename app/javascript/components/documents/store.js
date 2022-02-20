const update = require('immutability-helper')
const uuid = require('uuid')

const Reflux = require('reflux')

// LightGallery = require ('../../light_gallery_initializer')

MAX_FILE_SIZE = 1*1024*1024*1024 // 1 GB
QUEUE_RUN_SIZE = 2

class DocumentsStore extends Reflux.Store {
  constructor() {
    super(...arguments)
    this.state = this.buildState()
    this.newDocuments = []
    this.queue = []
  }

  registerListeners() {
    this.listenToMany(ReactModules.documents.actions)
  }

  buildState() {
    return {
      documents: [],
      documentsLoaded: false,
    }
  }

  onLoadDocumentsCompleted(response) {
    this.setState(update(this.state, { documents: { $set: response.documents }, documentsLoaded: { $set: true } }))
  }

  onUploadFileDrop(files) {
    if (files.length <= 0) {
      return;
    }
    this.newDocuments = files.map(function(file) {
      file.uuid = uuid.v1();
      return file;
    });
    let fileNames = this.newDocuments.map(function(file) {
      return {
        uuid: file.uuid,
        name: file.name
      };
    });
    ReactModules.documents.actions.prepareUpload(fileNames);
  }

  onPrepareUploadCompleted(result) {
    let size = 0;
    this.newDocuments.forEach((file) => {
      if (result.asciiNames != null) file.name = result.asciiNames[file.uuid]
      size += file.size;
    });

    this.processFiles(this.newDocuments, {
      url: result.formData.url,
      fields: result.formData.fields
    });
  }

  onDeleteDocumentCompleted(id) {
     this.setState(update(this.state, { documents: {$apply: (documents) => {
        let result = []
        for (let i = 0; i < documents.length; i++) {
          let item = documents[i]
          if (item.id === id) {
            continue;
          }
          result.push(item)
        }
        return result
      }}}))
  }

  processFiles(files, s3Form) {
    let queuedFiles = [];
    let documents = [];
    let timestampSeq = new Date().getTime();
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        window.alert_box(file.name + " is too large, maximum file size is 1.0GB.");
      } else if (file.size < 1) {
        window.alert_box(file.name + " is empty. Please select another file.");
      } else if (file.name.length === 0) {
        window.alert_box("File name is blank. Please rename it.");
      } else {
        let s3Key = s3Form.fields['x-ignore-pattern'].replace('__timestamp__', timestampSeq++);
        s3Key = s3Key.replace('${filename}', file.asciiName || file.name);
        documents.push({
          name: file.name,
          uuid: file.uuid,
          progress: void 0,
          size: file.size,
          status: 'queued',
          isNew: true
        });
        queuedFiles.push({
          uuid: file.uuid,
          file: file,
          s3Key: s3Key,
          s3Form: s3Form
        });
      }
    }
    this.addDocuments(documents);
    this.addToQueue(queuedFiles);
    return this.queueRun();
  }

  addDocuments(documents) {
    this.setState(update(this.state, { documents: { $push: documents } }))
  }

  addToQueue(fileObjs) {
    this.queue = update(this.queue, { $push: fileObjs })
  }

  queueRun() {
    let uploadingCount = this.queue.reduce(function(count, item) {
      if (item.uploading) {
        return count + 1;
      } else {
        return count;
      }
    }, 0);
    let toStart = QUEUE_RUN_SIZE - uploadingCount;
    if (toStart < 0) {
      toStart = 0;
    }
    let started = 0;
    for (let i = 0; i < this.queue.length; i++) {
      let item = this.queue[i];
      if (started >= toStart) {
        return;
      }
      if (item.uploading) {
        continue;
      }
      this.processUploadFile(item.uuid, item.s3Form, item.s3Key, item.file);
      started += 1;
    }
  }

  processUploadFile(uuid, s3Form, s3Key, file) {
    let progressFunc = this.curryId(ReactModules.documents.actions.uploadFileProgress, uuid);
    ReactModules.documents.actions.uploadFileS3(uuid, s3Form, s3Key, file, {
      onProgress: progressFunc,
      sendAbortFunction: ((abortFunc) => { this.updateQueueFile(uuid, { abort: { $set: abortFunc } }) })
    });
    this.updateQueueFile(uuid, {
      uploading: {
        $set: true
      }
    });
    this.updateDocument(uuid, {
      progress: {
        $set: 0
      },
      status: {
        $set: 'uploading'
      }
    });
  }

  updateQueueFile(uuid, query) {
    let result = [];
    for (i = 0; i < this.queue.length; i++) {
      let item = this.queue[i];
      if (item.uuid === uuid) {
        item = update(item, query);
      }
      result.push(item);
    }
    this.queue = result;
  }

  onUploadFileProgress(uuid, response) {
    this.updateDocument(uuid, {
      status: {
        $set: 'uploading'
      },
      progress: {
        $set: response.progress
      }
    });
  }

  updateDocument(uuid, query) {
    this.setState(update(this.state, {
      documents: {
        $apply: function(documents) {
          let result = [];
          for (let i = 0; i < documents.length; i++) {
            let item = documents[i];
            if (item.uuid === uuid) {
              item = update(item, query);
            }
            result.push(item);
          }
          return result;
        }
      }
    }));
  }

  onUploadFileS3Completed(uuid, response) {
    let queueItem = this.queue.find(function(item) { return item.uuid === uuid; });
    if (!queueItem) return;

    ReactModules.documents.actions.newUpload(uuid, {
      name: queueItem.file.name,
      size: queueItem.file.size,
      key: queueItem.s3Key
    });
  }

  onUploadFileS3Failed(uuid, response) {
    this.processUploadFail(uuid)
  }

  onNewUploadCompleted(uuid, response) {
    this.removeFromQueue({ uuid: uuid })
    this.updateDocument(uuid, {
      path: { $set: response.document.path || response.document.url },
      publicUrl: { $set: response.document.public_url },
      name: { $set: response.document.name },
      size: { $set: response.document.size },
      originalSize: { $set: response.document.original_size },
      id: { $set: response.document.id },
      thumbnail: { $set: response.document.thumbnail },
      preview: { $set: response.document.preview },
      status: { $set: 'successful' },
      progress: { $set: 100 }
    })
    this.queueRun()
  }

  onNewUploadFailed(uuid){
    this.processUploadFail(uuid)
  }

  processUploadFail(uuid) {
    this.updateDocument(uuid, { status: { $set: 'failed' } })
    this.removeFromQueue({ uuid: uuid })

    this.queueRun()
  }

  removeFromQueue(deleteOpts) {
    let result = [];
    for (i = 0; i < this.queue.lengt; i++) {
      let item = this.queue[i];
      if (!item.uuid === deleteOpts.uuid) {
        result.push(item);
      }
    }
    this.queue = result;
    return this.queue;
  }

  curryId(fun, id) {
    return ((...args) => { fun(...[id].concat(args)) });
  }
}

module.exports = Reflux.initStore(DocumentsStore)
