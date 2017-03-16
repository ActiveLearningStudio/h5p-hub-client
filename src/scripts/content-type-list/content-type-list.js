import ContetTypeListView from "./content-type-list-view";
import {EventDispatcher} from '../mixins/event-dispatcher';

/**
 * Row selected event
 * @event ContentTypeList#row-selected
 * @type {SelectedElement}
 */
/**
 * Update content type list event
 * @event ContentTypeList#update-content-type-list
 * @type {SelectedElement}
 */
/**
 * @class
 * @mixes EventDispatcher
 * @fires Hub#select
 * @fires ContentTypeList#row-selected
 * @fires ContentTypeList#update-content-type-list
 */
export default class ContentTypeList {
  constructor(state) {
    // add event system
    Object.assign(this, EventDispatcher());

    // add the view
    this.view = new ContetTypeListView(state);
    this.propagate(['row-selected', 'select'], this.view);
  }

  /**
   * Hide this element
   */
  hide() {
    this.view.hide();
  }

  /**
   * Show this element
   */
  show() {
    this.view.show();
  }

  /**
   * Update the list with new content types
   *
   * @param {ContentType[]} contentTypes
   */
  update(contentTypes) {
    this.view.removeAllRows();
    contentTypes.forEach(this.view.addRow, this.view);
    this.fire('update-content-type-list', {});
  }


  /**
   * Returns the views root element
   *
   * @return {HTMLElement}
   */
  getElement() {
    return this.view.getElement();
  }
}
