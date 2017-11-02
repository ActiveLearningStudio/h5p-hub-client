import React from 'react';
import Dictionary from '../../utils/dictionary';
import Message from '../../GenericComponents/Message/Message';
import '../../utils/fetch';

class UploadContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: false,
      filePath: '',
      isUploading: false,
      error: false
    };
    this.showUploadInput = this.showUploadInput.bind(this);
    this.select = this.select.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
  }

  showUploadInput() {
    this.refs.fileField.click();
  }

  select(event) {
    this.setState({error: false});
    const filePath = event.target.files[0].name;

    if (this.getFileExtension(filePath) !== 'h5p') {
      this.setState({
        isSelected: false,
        filePath: '',
        error: true,
        errorTitle: Dictionary.get('h5pFileWrongExtensionTitle'),
        errorMessage: Dictionary.get('h5pFileWrongExtensionContent')
      });
    }
    else {
      this.uploadInput = event.target;
      this.setState({isSelected: true, filePath, isUploading: false});

      event.stopPropagation();

      // Focus use button
      setTimeout((() => this.refs.useButton.focus()).bind(this), 10);
    }
  }

  uploadFile() {
    // Add the H5P file to a form, ready for transportation
    let data = new FormData();
    data.append('h5p', this.uploadInput.files[0]);
    data.append('contentId', this.props.contentId);

    this.setState({isSelected: true, filePath: '', isUploading: true});

    return fetch(this.props.getAjaxUrl('library-upload'), {
      method: 'POST',
      credentials: 'include',
      body: data
    }).then(result => result.json())
      .then(json => {
        // Validation failed
        if (json.success !== true) {
          this.setState({
            error: true,
            errorTitle: Dictionary.get('h5pFileValidationFailedTitle'),
            errorMessage: Dictionary.get('h5pFileValidationFailedContent')
          });
          return;
        }

        this.setState({isSelected: false, isUploading: false});
        this.props.onUpload(json.data);
      })
      .catch(() => {
        this.setState({
          isSelected: false,
          isUploading: false,
          error: true,
          errorTitle: Dictionary.get('h5pFileUploadServerErrorTitle'),
          errorMessage: Dictionary.get('h5pFileUploadServerErrorContent')
        });
      });
  }

  getFileExtension(fileName) {
    return fileName.replace(/^.*\./, '');
  }

  // TODO: Add 'Use' to the dictionary
  render() {
    return (
      <div className="upload-wrapper">
        {
          this.state.error &&
          <Message
            type={'error'}
            dismissable={false}
            title={this.state.errorTitle}
            message={this.state.errorMessage}
          />
        }
        <div className={"upload-throbber " + (this.state.isUploading ? '  ' : 'hidden')}
          aria-label="{Dictionary.get('uploadingThrobber')}"
          tabIndex="-1">
        </div>
        <h1 className="upload-instruction-header">{Dictionary.get('uploadInstructionsTitle')}</h1>
        <div className="upload-form">
          <input className="upload-path"
            placeholder={(this.state.isSelected ? this.state.filePath : Dictionary.get('uploadPlaceholder'))}
            onClick={this.showUploadInput}
            tabIndex="-1"
            disabled={this.state.isUploading}
            readOnly
          />
          <button ref="useButton" type="button"
            className={"button use-button " + (this.state.isSelected ? 'visible' : ' ')}
            disabled={this.state.isUploading}
            onClick={this.uploadFile}>Use
          </button>
          <div className="input-wrapper">
            <input ref="fileField" type="file" accept=".h5p" aria-hidden="true"
              onChange={this.select}
            />
            <button type="button"
              className="button upload-button"
              onClick={this.showUploadInput}
              disabled={this.state.isUploading}
              tabIndex="0">{this.isSelected ? Dictionary.get('uploadFileButtonLabel') : Dictionary.get('uploadFileButtonChangeLabel')}
            </button>
          </div>
        </div>
        <p className="upload-instruction-description" dangerouslySetInnerHTML={{__html: Dictionary.get('uploadInstructionsContent')}}/>
      </div>
    );
  }
}

export default UploadContent;
