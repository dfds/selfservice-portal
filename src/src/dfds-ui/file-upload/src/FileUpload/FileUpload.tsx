/* eslint-disable @typescript-eslint/ban-types */
import React from 'react'
import Dropzone, { Accept } from 'react-dropzone'

export type FileUploadProps = {
  onChange: (model: object[]) => object[]
  onError?: (model: Error) => object[]
  acceptedFiles: Accept
}

const FileUpload: React.FunctionComponent<FileUploadProps> = ({ onChange, acceptedFiles, ...rest }) => {
  function onDropzoneChange(acceptedFiles: any) {
    onChange(acceptedFiles)
  }
  return (
    <Dropzone onDrop={onDropzoneChange} accept={acceptedFiles} {...rest}>
      {({ getRootProps, getInputProps }) => (
        <section>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
          </div>
        </section>
      )}
    </Dropzone>
  )
}

export default FileUpload
