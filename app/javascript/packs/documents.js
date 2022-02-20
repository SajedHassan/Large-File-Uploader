window.ReactModules ||= {}

ReactModules.documents = require('../components/documents/module')
ReactModules.documents.store.registerListeners()
