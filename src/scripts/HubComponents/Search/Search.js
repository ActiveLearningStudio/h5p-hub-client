import React from 'react';
import Dictionary from '../../utils/dictionary';

class Search extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick() {
    console.log('click');

    // TODO: Document why
    /*this.trigger('search', {
      element: this.searchBar,
      query: this.searchBar.value
    });*/
  }

  handleFocus() {
    console.log('focus');

    // TODO: Document why
    /*search = setTimeout(() => {
      search = null;
    }, 40);*/
  }

  handleInput() {
    console.log('input');

    // TODO: Document why
    /*if (this.typeAheadEnabled && !search) {
      search = setTimeout(() => {
        this.trigger('search', {
          element: this.searchBar,
          query: this.searchBar.value
        });
        search = null;
      }, 40);
    }*/
  }

  handleKeyDown(event) {
    console.log('keydown', event.which);

    // TODO: Document why
    /*switch (event.which) {
      case 13: // Enter
        this.trigger('use');
        event.preventDefault();
        break;

      case 38: // Up
        this.trigger('previous');
        event.preventDefault();
        break;

      case 40: // Down
        this.trigger('next');
        event.preventDefault();
        break;
    }*/

  }

  handleBlur() {
    console.log('blur');

    // TODO: Document why
    //clearTimeout(search);
  }

  render() {
    let searchLabel = Dictionary.get('contentTypeSearchFieldPlaceholder');

    return (
      <div className="input-group" role="search">
        <input id="hub-search-bar"
          className="form-control form-control-rounded"
          type="text"
          aria-label={searchLabel}
          placeholder={searchLabel}
          onClick={this.handleClick.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          onInput={this.handleInput.bind(this)}
          onKeyDown={e => this.handleKeyDown(e)}
          onBlur={this.handleBlur.bind(this)} />
        <div className="input-group-addon icon-search"></div>
      </div>
    );
  }
}

export default Search;
