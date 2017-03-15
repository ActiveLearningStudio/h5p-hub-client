import { setAttribute, getAttribute, removeChild, hide, show } from "utils/elements";
import { curry, forEach } from "utils/functional";
import { Eventful } from '../mixins/eventful';
import initPanel from "components/panel";
import initImageScroller from "components/image-scroller";
import { relayClickEventAs } from '../utils/events';
import noIcon from '../../images/content-type-placeholder.svg';

/**
 * @constant {string}
 */
const ATTRIBUTE_CONTENT_TYPE_ID = 'data-id';

/**
 * @constant {number}
 */
const MAX_TEXT_SIZE_DESCRIPTION = 300;

/**
 * Toggles the visibility if an element
 *
 * @param {HTMLElement} element
 * @param {boolean} visible
 */
const toggleVisibility = (element, visible) => (visible ? show : hide)(element);

/**
 * Checks if a string is empty
 *
 * @param {string} text
 *
 * @return {boolean}
 */
const isEmpty = (text) => (typeof text === 'string') && (text.length === 0);

const hideAll = forEach(hide);

/**
 * @class
 * @mixes Eventful
 */
export default class ContentTypeDetailView {
  constructor(state) {
    // add event system
    Object.assign(this, Eventful());

    // create view
    this.rootElement = this.createView();

    // grab references
    this.buttonBar = this.rootElement.querySelector('.button-bar');
    this.useButton = this.buttonBar.querySelector('.button-use');
    this.installButton = this.buttonBar.querySelector('.button-install');
    this.buttons = this.buttonBar.querySelectorAll('.button');

    this.image = this.rootElement.querySelector('.content-type-image');
    this.title = this.rootElement.querySelector('.text-details h3');
    this.owner = this.rootElement.querySelector('.owner');
    this.description = this.rootElement.querySelector('.text-details .small');
    this.demoButton = this.rootElement.querySelector('.demo-button');
    this.carousel = this.rootElement.querySelector('.carousel');
    this.carouselList = this.carousel.querySelector('ul');
    this.licencePanel = this.rootElement.querySelector('.licence-panel');
    this.installMessage = this.rootElement.querySelector('.install-message');

    // hide message on close button click
    let installMessageClose = this.installMessage.querySelector('.message-close');
    installMessageClose.addEventListener('click', () => hide(this.installMessage));

    // init interactive elements
    initPanel(this.licencePanel);
    initImageScroller(this.carousel);

    // fire events on button click
    relayClickEventAs('close', this, this.rootElement.querySelector('.back-button'));
    relayClickEventAs('select', this, this.useButton);
    relayClickEventAs('install', this, this.installButton);
  }

  /**
   * Creates the view as a HTMLElement
   *
   * @return {HTMLElement}
   */
  createView () {
    const element = document.createElement('div');
    element.className = 'content-type-detail';
    element.setAttribute('aria-hidden', 'true');
    element.innerHTML = `
      <div class="back-button icon-arrow-thick"></div>
      <div class="container">
        <div class="image-wrapper"><img class="img-responsive content-type-image" src="${noIcon}"></div>
        <div class="text-details">
          <h3></h3>
          <div class="owner"></div>
          <p class="small"></p>
          <a class="button demo-button" target="_blank" aria-hidden="false" href="https://h5p.org/chart">Content Demo</a>
        </div>
      </div>
      <div class="carousel" role="region" data-size="5">
        <span class="carousel-button previous" aria-hidden="true" disabled><span class="icon-arrow-thick"></span></span>
        <span class="carousel-button next" aria-hidden="true" disabled><span class="icon-arrow-thick"></span></span>
        <nav class="scroller">
          <ul></ul>
        </nav>
      </div>
      <hr />
      <div class="install-message message dismissible simple info" aria-hidden="true">
        <div class="message-close icon-close"></div>
        <h3></h3>
      </div>
      <div class="button-bar">
        <span class="button button-primary button-use" aria-hidden="false" data-id="">Use</span>
        <span class="button button-inverse-primary button-install" aria-hidden="true" data-id=""><span class="icon-arrow-thick"></span>Install</span>
        <span class="button button-inverse-primary button-installing" aria-hidden="true"><span class="icon-loading-search icon-spin"></span>Installing</span>
      </div>
      <div class="panel-group">
        <div class="panel licence-panel" aria-hidden="true">
          <div class="panel-header" aria-expanded="false" aria-controls="licence-panel"><span class="icon-accordion-arrow"></span> The Licence Info</div>
          <div class="panel-body" id="licence-panel" aria-hidden="true">
            <div class="panel-body-inner"></div>
          </div>
        </div>
      </div>`;

    return element;
  }

  /**
   * Sets a message on install
   *
   * @param {boolean} success
   * @param {string} message
   */
  setInstallMessage({ success = true, message }){
    this.installMessage.querySelector('h3').innerText = message;
    this.installMessage.className = `install-message dismissible message simple ${success ? 'info' : 'error'}`;
    show(this.installMessage);
  }

  /**
   * Removes all images from the carousel
   */
  removeAllImagesInCarousel() {
    this.carouselList.querySelectorAll('li').forEach(removeChild(this.carouselList));
    this.carousel.querySelectorAll('.carousel-lightbox').forEach(removeChild(this.carousel));
  }

  /**
   * Add image to the carousel
   *
   * @param {object} image
   */
  addImageToCarousel(image) {
    // add lightbox
    const lightbox = document.createElement('div');
    lightbox.id = `lightbox-${this.carouselList.childElementCount}`;
    lightbox.className = 'carousel-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `<img class="img-responsive" src="${image.url}" alt="${image.alt}">`;
    this.carousel.appendChild(lightbox);

    // add thumbnail
    const thumbnail = document.createElement('li');
    thumbnail.className = 'slide';
    thumbnail.innerHTML = `<img src="${image.url}" alt="${image.alt}" class="img-responsive" aria-controls="${lightbox.id}" />`;
    this.carouselList.appendChild(thumbnail);
  }

  /**
   * Sets the image
   *
   * @param {string} src
   */
  setImage(src) {
    this.image.setAttribute('src', src || noIcon);
  }

  /**
   * Sets the title
   *
   * @param {string} id
   */
  setId(id) {
    this.installButton.setAttribute(ATTRIBUTE_CONTENT_TYPE_ID, id);
    this.useButton.setAttribute(ATTRIBUTE_CONTENT_TYPE_ID, id);
  }

  /**
   * Sets the title
   *
   * @param {string} title
   */
  setTitle(title) {
    this.title.innerHTML = `${title}`;
  }

  /**
   * Sets the long description
   *
   * @param {string} text
   */
  setDescription(text) {
    if(text.length > MAX_TEXT_SIZE_DESCRIPTION) {
      this.description.innerHTML = `${this.ellipsis(MAX_TEXT_SIZE_DESCRIPTION, text)}<span class="read-more link">Read more</span>`;
      this.description
        .querySelector('.read-more, .read-less')
        .addEventListener('click', () => this.toggleDescriptionExpanded(text));
      this.descriptionExpanded = false;
    }
    else {
      this.description.innerText = text;
    }
  }

  /**
   * Toggles Read less and Read more text
   *
   * @param {string} text
   */
  toggleDescriptionExpanded(text) {
    // flip boolean
    this.descriptionExpanded = !this.descriptionExpanded;

    if(this.descriptionExpanded) {
      this.description.innerHTML = `${text}<span class="read-less link">Read less</span>`;
    }
    else {
      this.description.innerHTML = `${this.ellipsis(MAX_TEXT_SIZE_DESCRIPTION, text)}<span class="read-more link">Read more</span>`;
    }

    this.description
      .querySelector('.read-more, .read-less')
      .addEventListener('click', () => this.toggleDescriptionExpanded(text));
  }

  /**
   * Shortens a string, and puts an elipsis at the end
   *
   * @param {number} size
   * @param {string} text
   */
  ellipsis(size, text) {
    return `${text.substr(0, size)}...`;
  }

  /**
   * Sets the licence
   *
   * @param {string} type
   */
  setLicence(type) {
    if(type){
      this.licencePanel.querySelector('.panel-body-inner').innerText = type;
      show(this.licencePanel);
    }
    else {
      hide(this.licencePanel);
    }
  }

  /**
   * Sets the long description
   *
   * @param {string} owner
   */
  setOwner(owner) {
    if(owner) {
      this.owner.innerHTML = `By ${owner}`;
    }
    else {
      this.owner.innerHTML = '';
    }
  }

  /**
   * Sets the example url
   *
   * @param {string} url
   */
  setExample(url) {
    this.demoButton.setAttribute('href', url || '#');
    toggleVisibility(this.demoButton, !isEmpty(url));
  }

  /**
   * Sets if the content type is installed
   *
   * @param {boolean} installed
   */
  setIsInstalled(installed) {
    this.showButtonBySelector(installed ? '.button-use' : '.button-install');
  }

  /**
   * Hides all buttons and shows the button on the selector again
   *
   * @param {string}selector
   */
  showButtonBySelector(selector) {
    const button = this.buttonBar.querySelector(selector);

    if(button) {
      hideAll(this.buttons);
      show(button);
    }
  }

  /**
   * Sets install button icon cls
   *
   * @param {string} className
   */
  setInstallButtonIcon(className) {
    const icon = this.installButton.querySelector('[class^="icon-"]');
    icon.className = className;
  }

  /**
   * Hides the root element
   */
  hide() {
    hide(this.rootElement);
  }

  /**
   * Shows the root element
   */
  show() {
    show(this.rootElement);
  }

  /**
   * Returns the root html element
   * @return {HTMLElement}
   */
  getElement() {
    return this.rootElement;
  }
}