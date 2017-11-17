import React from 'react';
import PropTypes from 'prop-types';
import './UploadContent.scss';
import fetchJSON from '../../../utils/fetchJSON';
import Dictionary from '../../../utils/dictionary';
import Message from '../../Message/Message';
import UploadForm from './UploadForm/UploadForm';

class UploadContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileSelected: false,
      filePath: '',
      fileUploading: false,
      error: undefined,
      uploadData: {},
    };
    this.handleValidation = this.handleValidation.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleValidation(event) {
    this.setState({error: undefined});

    if (event.target.files.length === 0) {
      return; // Do nothing if the file has not been changed
    }

    const filePath = event.target.files[0].name;

    if (this.getFileExtension(filePath) !== 'h5p') {
      this.setState({
        fileSelected: false,
        filePath: '',
        error: {
          title: Dictionary.get('h5pFileWrongExtensionTitle'),
          message: Dictionary.get('h5pFileWrongExtensionContent')
        }
      });
    }
    else {
      this.setState({
        fileSelected: true,
        filePath,
        fileUploading: false,
        uploadData: event.target.files[0],
      });
      event.stopPropagation();
    }
  }

  handleUpload() {
    this.setState({
      fileSelected: true,
      fileUploading: true
    });

    // Add the H5P file to a form, ready for transportation
    let data = new FormData();
    data.append('h5p', this.state.uploadData);
    data.append('contentId', this.props.contentId);


    fetchJSON(this.props.getAjaxUrl('library-upload'), data)
      .then(response => {
        // Upload success, inform parent
        this.props.onUpload(response.data);

        this.setState({
          fileSelected: false,
          fileUploading: false,
          filePath: '',
          uploadData: {},
        });
      })
      .catch(reason => {
        // Upload failed
        this.setState({
          fileSelected: false,
          fileUploading: false,
          error: reason,
          filePath: '',
          uploadData: {}
        });
      });
  }

  getFileExtension(fileName) {
    return fileName.replace(/^.*\./, '');
  }

  handleErrorDismiss = () => {
    this.setState({
      error: null
    });
  }

  render() {
    return (
      <div className="upload-wrapper">
        {
          !!this.state.error &&
          <Message
            {...this.state.error}
            severity='error'
            onClose={this.handleErrorDismiss}/>
        }
        <div className={"upload-throbber" + (this.state.fileUploading ? '' : ' hidden')}
          aria-label={Dictionary.get('uploadingThrobber')}/>
        <h1 className="upload-instruction-header">{Dictionary.get('uploadInstructionsTitle')}</h1>
        <UploadForm
          fileSelected={this.state.fileSelected}
          fileUploading={this.state.fileUploading}
          filePath={this.state.filePath}
          setFocus={this.props.setFocus}
          onValidate={this.handleValidation}
          onUpload={this.handleUpload}
        />
        <p className="upload-instruction-description"
          dangerouslySetInnerHTML={{__html: Dictionary.get('uploadInstructionsContent')}}
        />
      </div>
    );
  }
}

UploadContent.propTypes = {
  contentId: PropTypes.number.isRequired,
  onUpload: PropTypes.func.isRequired,
  getAjaxUrl: PropTypes.func.isRequired,
  setFocus: PropTypes.bool.isRequired
};

export default UploadContent;
