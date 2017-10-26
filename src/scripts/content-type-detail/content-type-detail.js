import ContetTypeDetailView from "./content-type-detail-view";
import {Eventful} from '../mixins/eventful';
import Dictionary from '../utils/dictionary';
import { preloadImages } from '../utils/media';

/**
 * @class
 * @mixes Eventful
 */
export default class ContentTypeDetail {
  constructor(state, services) {
    // add event system
    Object.assign(this, Eventful());

    // set member variables
    this.apiVersion = state.apiVersion;

    // services
    this.services = services;

    // views
    this.view = new ContetTypeDetailView(state);
    this.view.on('install', ({id}) => {
      this.services.contentType(id)
        .then(contentType => {
          return this.install({
            id: contentType.machineName,
            title: contentType.title,
            installed: contentType.installed
          });
        });
    }, this);
    this.view.on('show-license-dialog', this.showLicenseDialog, this);
    this.view.on('hide-license-dialog', () => this.view.focusLicenseDetailsButton());

    // propagate events
    this.propagate(['close', 'select', 'modal'], this.view);
  }

  /**
   * Hides the detail view
   */
  hide() {
    this.view.hide();
  }

  /**
   * Shows the detail view
   */
  show() {
    this.view.show();
  }

  /**
   * Focuses on the title
   */
  focus() {
    this.view.focus();
  }

  /**
   * Returns whether the detailview is hidden
   *
   * @return {boolean}
   */
  isHidden() {
    return this.view.isHidden();
  }

  /**
   * Loads a Content Type description
   *
   * @param {string} id
   *
   * @return {Promise.<ContentType>}
   */
  loadById(id) {
    this.services.contentType(id)
      .then(this.update.bind(this));
  }

  /**
   * Displays the license dialog
   *
   * @param {string} licenseId
   */
  showLicenseDialog({ licenseId }) {
    const licenseDialog = this.view.createLicenseDialog(this.services.getLicenseDetails(licenseId));

    // triggers the modal event
    this.trigger('modal', {
      element: licenseDialog
    });

    // set focus on the modal dialog
    setTimeout(() => licenseDialog.querySelector('.modal-header').focus(), 10);
  }

  /**
   * Loads a Content Type description
   *
   * @param {string} id
   * @param {boolean} installed Whether the content type is already installed
   *
   * @return {Promise.<ContentType>}
   */
  install({id, installed, title}) {
    // set spinner
    this.view.toggleSpinner(true);

    return this.services.installContentType(id).then(response => {
      this.trigger('installed-content-type');
      this.view.removeMessages();
      this.view.toggleSpinner(false);
      this.view.setIsInstalled(true);
      this.view.setIsUpdatePossible(false);

      const installMessageKey = installed ? 'contentTypeUpdateSuccess'
        : 'contentTypeInstallSuccess';

      this.view.setInstallMessage({
        message: Dictionary.get(installMessageKey, {':contentType': title})
      });
    }).catch(error => {
      this.view.toggleSpinner(false);

      // print error message
      let errorMessage = (error.errorCode) ? error : {
        success: false,
        errorCode: 'RESPONSE_FAILED',
        message: Dictionary.get('contentTypeInstallError', {':contentType': title})
      };
      this.view.setInstallMessage(errorMessage);

      // log whole error message to console
      console.error('Installation error', error);
    });
  }

  /**
   * Updates the view with the content type data
   *
   * @param {ContentType} contentType
   */
  update(contentType) {
    this.view.reset();

    this.view.setId(contentType.machineName);
    this.view.setTitle(contentType.title || contentType.machineName);
    this.view.setDescription(contentType.description);
    this.view.setImage(contentType.icon);
    this.view.setExample(contentType.example);
    this.view.setOwner(contentType.owner);
    this.view.setIsInstalled(contentType.installed);
    this.view.setLicense(contentType.license);
    const isUpdatePossible = contentType.installed &&
      !contentType.isUpToDate &&
      contentType.canInstall;
    this.view.setIsUpdatePossible(isUpdatePossible, contentType.title || contentType.machineName);

    // update carousel
    if (contentType.screenshots) {
      // Fetch screenshots if they exist
      preloadImages(contentType.screenshots)
        .then(screenshots => this.view.setScreenshots(screenshots));
    }
  }

  /**
   * Returns the root html element
   *
   * @return {HTMLElement}
   */
  getElement() {
    return this.view.getElement();
  }
}
