import LightGallery from 'lightgallery/react';
import React from "react";
import Reflux from "reflux";
import Dropzone from "react-dropzone"
import { Button } from 'antd';
import { DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { Card, Col, Row } from 'antd';

export default class Documents extends Reflux.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.store = ReactModules.documents.store
    ReactModules.documents.actions.loadDocuments({})
  }

  render() {
    return (
      <div id='documents-page-container'>
        <div className='documents-header'>
          <h1>Documents</h1>
        </div>
        <div className='actions-documents-container'>
          <div className='button add_button white-grey-btn add-document'>
              <Button type="primary">
                  <span className='ql-format-button ql-document'  title='Select from Computer' onClick={() => this._openDropzone()} >
                      Add Document
                  </span>
              </Button>
          </div>
        </div>
        {
          (this.state.documents.length == 0 && this.state.documentsLoaded) && (
            <div className='no-files-added'>No files added</div>
          )
        }
        <Dropzone className='hidden' ref={((dropzone) => {this.dropzone = dropzone})} onDrop={ReactModules.documents.actions.uploadFileDrop} >
          {
            ({getRootProps, getInputProps}) => (
              <section className="dropzone">
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag and drop some files here, or click to select files</p>
                </div>
              </section>
            )
          }
        </Dropzone>
        <div className="site-card-wrapper mp-15 mb-15">
              <Row gutter={16}>
                  {
                      this.state.documents.map((document) => {
                          return (
                              <Col key={document.id || document.uuid} span={8} className="mp-15 mb-15">
                                  <Card title={document.name} bordered={true}>
                                      <span className="corners-aligned-row" >
                                          { document.size }
                                          <span>
                                            <Button type="primary" className="mx-5" shape="circle" onClick={() => {navigator.clipboard.writeText(document.public_url)}}><LinkOutlined /></Button>
                                            <Button type="primary" danger shape="circle" onClick={() => ReactModules.documents.actions.deleteDocument(document.id)}><DeleteOutlined/></Button>
                                          </span>
                                      </span>
                                  </Card>
                              </Col>
                          )
                      })
                  }
              </Row>
        </div>
      </div>
    )
  }

  _openDropzone() {
    this.dropzone.open()
  }
};