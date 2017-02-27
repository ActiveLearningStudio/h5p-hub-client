import {curry, forEach, filter} from "../../../node_modules/h5p-sdk/src/scripts/utils/functional"
import HubServices from "../hub-services";
import lunr from "../../../node_modules/lunr"

/**
 * Filters a list of content types based on an array of ids
 *
 * @param  {string[]}         ids
 * @param  {ContentType[]}    contentTypes
 * @return {ContentType[]}
 */
const contentTypeInIds = curry(function(ids, contentType) {
  return ids.some(id => contentType.id == id);
});

/**
 * @class
 */
export default class SearchService {
  constructor() {
    this.services = new HubServices({
      rootUrl: '/test/mock/api'
    });

    // Set up lunr index
    this.index = lunr(function (){
      this.field('title', {boost: 10});
      this.field('shortDescription');
      this.ref('id');
    });

    this.contentTypes = this.services.contentTypes(); // Get content types
    this.contentTypes.then(forEach(this.addToIndex.bind(this))); // Add content types to search index
  }

  /**
   * addToIndex - Adds a content type to the search index
   *
   * @param  {Object} contentType
   */
  addToIndex(contentType) {
    this.index.add({
      title: contentType.title,
      shortDescription: contentType.shortDescription,
      id: contentType.id
    });
  }

  /**
   * Performs a search
   *
   * @param {String} query
   *
   * @return {Promise<ContentType[]>}
   */
  search(query) {
    const ids = this.index.search(query).map(result => result.ref);
    return this.contentTypes.then(filter(contentTypeInIds(ids)));
  }
}
