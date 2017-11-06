import React from 'react';
import ListItem from './ListItem/ListItem';
import Choose from '../../../Choose/Choose';

import './List.scss';

class List extends React.Component {
  constructor(props) {
    super(props);
  }

  getLibrary = (id) => {
    for (var i = 0; i < this.props.contentTypes.length; i++) {
      const library = this.props.contentTypes[i];
      if (library.machineName.toLocaleLowerCase().replace('.','-') === id) {
        return library;
      }
    }
  }

  handleUse = (event, contentType) => {
    this.props.onUse(contentType);
    event.preventDefault();
  }

  handleFocus = (id) => {
    this.props.onFocus(this.getLibrary(id));
  }

  handleSelect = (id) => {
    this.props.onSelect(this.getLibrary(id));
  }

  render() {
    const listItems = this.props.contentTypes.map((contentType, i) => (
      <li key={i} id={contentType.machineName.toLocaleLowerCase().replace('.','-')} className="media">
        <ListItem contentType={contentType}
          tabindex={this.props.focused ? (this.props.focused === contentType ? 0 : -1) : (i === 0 ? 0 : -1)} />
      </li>
    ));

    return (
      <div className="content-type-list" aria-hidden={!this.props.visible}>
        {this.props.contentTypes.length ? (
          <ol>
            <Choose selected={this.props.focused ? this.props.focused.machineName.toLocaleLowerCase().replace('.','-') : null}
              onChange={this.handleSelect}
              onFocus={this.handleFocus}>
              {listItems}
            </Choose>
          </ol>
        ) : (
          <div className="no-results">
            <div className="no-results-title">No results found</div>
            <div className="no-results-desc">There is no content type that matches your search criteria.</div>
          </div>
        )}
      </div>
    );
  }
}

export default List;
