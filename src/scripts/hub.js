import HubView from './hub-view';
import ContentTypeSection from './content-type-section/content-type-section';
import UploadSection from './upload-section/upload-section';
import HubServices from './hub-services';
import { Eventful } from './mixins/eventful';
import {renderErrorMessage} from './utils/errors';
/**
 * @typedef {object} HubState
 * @property {string} title
 * @property {string} sectionId
 * @property {boolean} expanded
 * @property {string} apiRootUrl
 */
/**
 * @typedef {object} ErrorMessage
 * @property {string} message
 * @property {string} errorCode
 */
/**
 * @typedef {object} SelectedElement
 * @property {HTMLElement} element
 * @property {string} id
 */
/**
 * Select event
 * @event Hub#select
 * @type {SelectedElement}
 */
/**
 * Error event
 * @event Hub#error
 * @type {ErrorMessage}
 */
/**
 * @class
 * @mixes Eventful
 * @fires Hub#select
 * @fires Hub#error
 */
export default class Hub {
  /**
   * @param {HubState} state
   */
  constructor(state) {
    // add event system
    Object.assign(this, Eventful());

    // controllers
    this.contentTypeSection = new ContentTypeSection(state);
    this.uploadSection = new UploadSection(state);

    // views
    this.view = new HubView(state);

    // services
    this.services = new HubServices({
      apiRootUrl: state.apiRootUrl
    });

    // propagate controller events
    this.propagate(['select', 'error'], this.contentTypeSection);

    // handle events
    this.on('select', this.setPanelTitle, this);
    this.on('select', this.view.closePanel, this.view);
    // only initialize the main panel if no errors have occured when updating the content type list
    this.view.on('tab-change', this.view.setSectionType, this.view);
    this.view.on('panel-change', this.view.togglePanelOpen.bind(this.view), this.view);
    this.contentTypeSection.on('update-content-type-list', this.view.initializePanel.bind(this.view), this.view);

    this.initTabPanel()
  }

  /**
   * Returns the promise of a content type
   * @param {string} machineName
   * @return {Promise.<ContentType>}
   */
  getContentType(machineName) {
    return this.services.contentType(machineName);
  }

  /**
   * Sets the title of the panel
   *
   * @param {string} id
   */
  setPanelTitle({id}) {
    this.getContentType(id).then(({title}) => this.view.setTitle(title));
  }

  /**
   * Initiates the tab panel
   */
  initTabPanel() {
    const tabConfigs = [{
      title: 'Create Content',
      id: 'content-types',
      content: this.contentTypeSection.getElement(),
      selected: true
    },
    {
      title: 'Upload',
      id: 'upload',
      content: this.uploadSection.getElement()
    }];

    tabConfigs.forEach(tabConfig => this.view.addTab(tabConfig));
    this.view.addBottomBorder(); // Adds an animated bottom border to each tab
    this.view.initTabPanel();
  }

  /**
   * Returns the root element in the view
   *
   * @return {HTMLElement}
   */
  getElement() {
    return this.view.getElement();
  }
}
