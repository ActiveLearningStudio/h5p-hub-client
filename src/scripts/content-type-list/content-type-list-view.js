import { curry } from "utils/functional";
import { setAttribute, getAttribute, hasAttribute, removeChild, querySelector, hide, show } from "utils/elements";
import { Eventful } from '../mixins/eventful';
import { relayClickEventAs } from '../utils/events';
import noIcon from '../../images/content-type-placeholder.svg';
import Keyboard from 'utils/keyboard';
import Dictionary from '../utils/dictionary';

/**
 * @function
 */
const hasTabindex = hasAttribute('tabindex');

/**
 * @function
 */
const getRowId = getAttribute('data-id');

/**
 * @class
 * @mixes Eventful
 * @fires Hub#select
 * @fires ContentTypeList#row-selected
 */
export default class ContentTypeListView {
  constructor(state) {
    // add event system
    Object.assign(this, Eventful());

    // setup keyboard
    this.keyboard = new Keyboard();
    this.keyboard.onSelect = element => {
      this.trigger('row-selected', {
        element: element,
        id: getRowId(element)
      });
    };

    // create root element
    this.rootElement = document.createElement('ul');
    this.rootElement.setAttribute('role', 'list');
    this.rootElement.className = 'content-type-list';
  }

  /**
   * Hides the root element from keyboard input
   */
  hideFromKeyboard() {
    this.rootElement.setAttribute('aria-hidden', 'true');
  }

  /**
   * Shows the root element to keyboard input
   */
  showToKeyboard() {
    this.rootElement.removeAttribute('aria-hidden');
  }

  /**
   * Focuses on the previously selected element
   */
  focus() {
    const selectedElement = querySelector('li[tabindex="0"]', this.rootElement);

    if(selectedElement) {
      selectedElement.focus();
    }
  }

  /**
   * Removes all rows from root element
   */
  removeAllRows() {
    while(this.rootElement.hasChildNodes()){
      let row = this.rootElement.lastChild;

      this.keyboard.removeElement(row);
      this.rootElement.removeChild(row);
    }
  }

  /**
   * Adds a row
   *
   * @param {ContentType} contentType
   */
  addRow(contentType) {
    const row = this.createContentTypeRow(contentType, this);
    relayClickEventAs('row-selected', this, row);
    this.rootElement.appendChild(row);
    this.keyboard.addElement(row);
  }

  /**
   * Takes a Content Type configuration and creates a row dom
   *
   * @param {ContentType} contentType
   * @param {Eventful} scope
   *
   * @return {HTMLElement}
   */
  createContentTypeRow(contentType, scope) {
    // create ids
    const index = this.rootElement.querySelectorAll('li').length;
    const contentTypeRowTitleId = `content-type-row-title-${index}`;
    const contentTypeRowDescriptionId = `content-type-row-description-${index}`;

    // field configuration
    const useButtonConfig = { text: Dictionary.get('contentTypeUseButtonLabel'), cls: 'button-primary', icon: '' };
    const installButtonConfig = { text: Dictionary.get('contentTypeGetButtonLabel'), cls: 'button-inverse-primary button-install', icon: 'icon-arrow-thick'};
    const button = contentType.installed ?  useButtonConfig: installButtonConfig;
    const title = contentType.title || contentType.machineName;
    const description = contentType.summary || '';
    const image = contentType.icon || noIcon;
    const disabled = contentType.restricted ? 'disabled="disabled"' : '';
    const updateAvailable = !contentType.isUpToDate && contentType.installed && !contentType.restricted;

    // row item
    const element = document.createElement('li');
    element.id = `content-type-${contentType.machineName}`;
    element.classList.add('media');
    element.setAttribute('data-id', contentType.machineName);
    element.setAttribute('aria-labelledby', contentTypeRowTitleId);
    element.setAttribute('aria-describedby', contentTypeRowDescriptionId);

    // create html
    element.innerHTML = `
      <div class="media-left">
        <img class="media-object" src="${image}" alt="${title} ${Dictionary.get('contentTypeIconAltText')}" />
      </div>

      <div class="media-body">
        <div id="${contentTypeRowTitleId}" class="h4 media-heading">${title}</div>
      
        <button aria-describedby="${contentTypeRowTitleId}" class="button ${button.cls}" data-id="${contentType.machineName}" tabindex="-1" ${disabled}>
          <span class="${button.icon}"></span>
          ${button.text}
        </button>
        
        <div class="content-type-update-info${updateAvailable ? '' : ' hidden'}">
          ${Dictionary.get('contentTypeUpdateAvailable')}
        </div>
        
        <div id="${contentTypeRowDescriptionId}" class="description">${description}</div>
      </div>
   `;

    // handle use button
    const useButton = element.querySelector('.button-primary');
    if(useButton){
      relayClickEventAs('select', scope, useButton);
    }

    // listens for tabindex change, and update button too
    const actionButton = element.querySelector('.button');
    let observer = new MutationObserver(records => {
      let el = records[0].target;

      // use -1 since element is <button>
      actionButton.setAttribute('tabindex', hasTabindex(el) ? '0' : '-1');
    });

    observer.observe(element, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["tabindex"]
    });

    return element;
  }

  /**
   * Returns the root element
   *
   * @return {HTMLElement}
   */
  getElement() {
    return this.rootElement;
  }
}
