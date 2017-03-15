import ContentTypeSectionView from "./content-type-section-view";
import SearchService from "../search-service/search-service";
import ContentTypeList from '../content-type-list/content-type-list';
import ContentTypeDetail from '../content-type-detail/content-type-detail';
import {Eventful} from '../mixins/eventful';
import {renderErrorMessage} from '../utils/errors';

export const ContentTypeSectionTabs = {
  ALL: {
    eventName: 'all',
    text: 'All'
  },
  MY_CONTENT_TYPES: {
    eventName: 'my-content-types',
    text: 'My Content Types'
  },
  MOST_POPULAR: {
    eventName: 'most-popular',
    text: 'Most Popular',
    filterProperty: 'popularity'
  }
};

/**
 * @class ContentTypeSection
 * @mixes Eventful
 *
 * @fires Hub#select
 */
export default class ContentTypeSection {
  /**
   * @param {HubState} state
   */
  constructor(state) {
    // add event system
    Object.assign(this, Eventful());

    this.typeAheadEnabled = true;

    // add view
    this.view = new ContentTypeSectionView(state);

    // controller
    this.searchService = new SearchService({ apiRootUrl: state.apiRootUrl });
    this.contentTypeList = new ContentTypeList();
    this.contentTypeDetail = new ContentTypeDetail({ apiRootUrl: state.apiRootUrl });

    // add menu items
    for (const tab in ContentTypeSectionTabs) {
      if (ContentTypeSectionTabs.hasOwnProperty(tab)) {
        const tabItem = ContentTypeSectionTabs[tab];
        this.view.addMenuItem(tabItem.text, tabItem.eventName);
      }
    }
    this.view.initMenu();

    // Element for holding list and details views
    const section = document.createElement('div');
    section.classList.add('content-type-section');

    this.rootElement = section;
    this.rootElement.appendChild(this.contentTypeList.getElement());
    this.rootElement.appendChild(this.contentTypeDetail.getElement());

    this.view.getElement().appendChild(this.rootElement);

    // propagate events
    this.propagate(['select', 'update-content-type-list'], this.contentTypeList);
    this.propagate(['select'], this.contentTypeDetail);

    // register listeners
    this.view.on('search', this.search, this);
    this.view.on('search', this.resetMenuSelection, this);
    this.view.on('search', this.resetMenuOnEnter, this);
    this.view.on('menu-selected', this.applySearchFilter, this);
    this.view.on('menu-selected', this.clearInputField, this);
    this.contentTypeList.on('row-selected', this.showDetailView, this);
    this.contentTypeDetail.on('close', this.closeDetailView, this);
    this.contentTypeDetail.on('select', this.closeDetailView, this);

    this.initContentTypeList();
  }

  /**
   * Initiates the content type list with a search
   */
  initContentTypeList() {
    // initialize by search
    this.searchService.search("")
      .then(contentTypes => this.contentTypeList.update(contentTypes))
      .catch(error => this.fire('error', error));
  }

  /**
   * Executes a search and updates the content type list
   *
   * @param {string} query
   */
  search({query, keyCode}) {
    if (this.typeAheadEnabled || keyCode === 13) { // Search automatically or on 'enter'
      this.searchService.search(query)
        .then(contentTypes => this.contentTypeList.update(contentTypes));
    }
  }

  /**
   *  Ensures the first menu element is selected
   */
  resetMenuSelection() {
    this.view.resetMenuSelection();
  }

  resetMenuOnEnter({keyCode}) {
    if (keyCode === 13) {
      this.closeDetailView();
    }
  }

  /**
   * Applies search filter depending on what event it receives
   *
   * @param {Object} e Event
   * @param {string} e.choice Event name of chosen tab
   */
  applySearchFilter(e) {
    switch(e.choice) {
      case ContentTypeSectionTabs.MOST_POPULAR.eventName:
        // Filter on tab's filter property, then update content type list
        this.searchService
          .filter(ContentTypeSectionTabs.MOST_POPULAR.filterProperty)
          .then(cts => {this.contentTypeList.update(cts)});
        break;
    }

  }

  clearInputField({element}) {
    if (!this.view.isFirstMenuItem(element)) {
      this.view.clearInputField(element);
    }
  }

  /**
   * Shows detail view
   *
   * @param {string} id
   */
  showDetailView({id}) {
    this.contentTypeList.hide();
    this.contentTypeDetail.loadById(id);
    this.contentTypeDetail.show();
    this.typeAheadEnabled = false;
  }


  /**
   * Close detail view
   */
  closeDetailView() {
    this.contentTypeDetail.hide();
    this.contentTypeList.show();
    this.typeAheadEnabled = true;
  }

  /**
   * Returns the element
   *
   * @return {HTMLElement}
   */
  getElement() {
    return this.view.getElement();
  }
}
