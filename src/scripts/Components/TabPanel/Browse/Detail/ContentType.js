import React from 'react';
import PropTypes from 'prop-types';

import Dictionary from '../../../../utils/dictionary';
import fetchJSON from '../../../../utils/fetchJSON';
import noIcon from '../../../../../images/content-type-placeholder.svg';

import Message from '../../../Message/Message';
import Modal from './Modal/Modal';
import ContentTypeAccordion from './ContentTypeAccordion';
import ImageSlider from './ImageSlider/ImageSlider';
import ButtonBar from './ButtonBar';
import ReadMore from './ReadMore';

import './ContentType.scss';

class ContentType extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      selectedScreenshot: 0,
      modalIsOpen: false,
      installed: false,
      canInstall: false,
      updatable: false,
      omstalling: false,
      showImageSlider: true,
      message: undefined
    };
  }

  componentWillReceiveProps(props) {
    if (!props.library) {
      return;
    }

    if (this.props.library !== props.library) {
      // Reset messages when library change
      this.setState({
        errorMessage: null,
        infoMessage: null
      });
    }

    this.setState({
      installed: props.library.installed,
      canInstall: props.library.canInstall,
      updatable: !props.library.isUpToDate,
      installing: false,
      visible: props.visible,
      showImageSlider: true,
    });
  }

  componentDidMount() {
    if (this.container) {
      this.container.addEventListener('transitionend', this.onTransitionEnd);
    }
  }

  componentWillUnmount() {
    if (this.container) {
      this.container.removeEventListener('transitionend', this.onTransitionEnd);
    }
  }

  onTransitionEnd = () => {
    if (!this.state.visible && this.state.showImageSlider) {
      this.setState({showImageSlider: false});
    }
  }

  onImageSelect = (index) => {
    this.setState({
      modalIsOpen: true,
      selectedScreenshot: index
    });
  }

  onModalClose = () => {
    this.setState({
      modalIsOpen: false
    });
  }

  handleInstall = () => {
    this.setState({
      installing: true,
      errorMessage: null,
      infoMessage: null
    });

    fetchJSON(this.props.getAjaxUrl('library-install', {id: this.props.library.machineName}), 'POST')
      .then(response => {
        // Install success, update parent
        this.props.onInstall(response);

        const installMessageKey = this.props.installed ? 'contentTypeUpdateSuccess' : 'contentTypeInstallSuccess';
        const title = this.props.library.title || this.props.library.machineName;
        this.setState({
          installed: true,
          installing: false,
          infoMessage: {
            title: Dictionary.get(installMessageKey, {':contentType': title}),
            details: response.details
          }
        });
      })
      .catch(reason => {
        // Install failed
        this.setState({
          installed: false,
          installing: false,
          errorMessage: reason
        });
      });
  }

  close = () => {
    this.props.onClose();
  }

  handleUse = () => {
    this.close();
    this.props.onUse(this.props.library);
  }

  handleErrorDismiss = () => {
    this.setState({
      errorMessage: null
    });
  }

  handleInfoDismiss = () => {
    this.setState({
      infoMessage: null
    });
  }

  render() {

    const classNames = 'content-type-detail' + (this.state.visible ? ' show' : '');
    const titleId = 'content-type-detail-view-title';

    // On the first render, no library is selected. We add an empty DIV,
    // just to get the sliding effect when viewing the first library
    if (!this.props.library) {
      return (
        <div className={classNames} id="content-type-detail" ref={container => this.container = container}/>
      );
    }

    return (
      <div className={classNames} id="content-type-detail" role="region" tabIndex="-1" aria-labelledby={titleId} ref={container => this.container = container}>
        <button type="button" className="back-button icon-arrow-thick" aria-label={Dictionary.get('contentTypeBackButtonLabel')} tabIndex="0" onClick={this.close}></button>
        <div className="container">
          <div className="image-wrapper">
            <img className="img-responsive content-type-image" src={this.props.library.icon || noIcon}/>
          </div>
          <div className="text-details">
            <h2 id="{titleId}" className="title" tabIndex="-1">{this.props.library.title || this.props.library.machineName}</h2>
            <div className="owner">{this.props.library.owner}</div>
            <ReadMore
              text={this.props.library.description}
              maxLength={285}
            />
            <a className="button demo-button" target="_blank" href={this.props.library.example || '#'}>
              {Dictionary.get("contentTypeDemoButtonLabel")}
            </a>
          </div>
        </div>
        {
          this.state.showImageSlider &&
          <ImageSlider
            images={this.props.library.screenshots}
            onImageSelect={this.onImageSelect}
            showProgress={false}
            selected={this.state.selectedScreenshot}/>
        }
        <hr />
        {
          !!this.state.errorMessage &&
          <Message
            severity='error'
            title={this.state.errorMessage.title}
            message={this.state.errorMessage.details}
            onClose={this.handleErrorDismiss}/>
        }
        {
          !!this.state.infoMessage &&
          <Message
            severity='info'
            title={this.state.infoMessage.title}
            message={this.state.infoMessage.details}
            onClose={this.handleInfoDismiss}/>
        }
        <ButtonBar
          installed={this.state.installed}
          canInstall={this.state.canInstall}
          updatable={this.state.updatable}
          installing={this.state.installing}
          onInstall={this.handleInstall}
          onUse={this.handleUse}
        />
        {
          this.props.library.license &&
          <ContentTypeAccordion
            id={this.props.library.license.id}
            attributes={this.props.library.license.attributes}
          />
        }
        <Modal
          visible={this.state.modalIsOpen}
          onClose={this.onModalClose}
          label={Dictionary.get('imageLightboxTitle')}
        >
          <ImageSlider
            images={this.props.library.screenshots}
            imagesToShow={1}
            showProgress={true}
            selected={this.state.selectedScreenshot}/>
        </Modal>
      </div>
    );
  }
}

ContentType.propTypes = {
  library: PropTypes.shape({
    installed: PropTypes.bool.isRequired,
    canInstall: PropTypes.bool.isRequired,
    isUpToDate: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
    example: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string.isRequired,
    machineName: PropTypes.string.isRequired,
    screenshots: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired
    })),
    owner: PropTypes.string.isRequired,
    icon: PropTypes.string,
    license: PropTypes.shape({
      id: PropTypes.string.isRequired,
      attributes: PropTypes.shape({
        canHoldLiable: PropTypes.bool.isRequired,
        useCommercially: PropTypes.bool,
        modifiable: PropTypes.bool,
        distributable: PropTypes.bool,
        sublicensable: PropTypes.bool,
        mustIncludeCopyright: PropTypes.bool,
        mustIncludeLicense: PropTypes.bool
      })
    }),
    onInstall: PropTypes.func.required,
    onUse: PropTypes.func.required,
    onClose: PropTypes.func.required
  })
};

export default ContentType;
