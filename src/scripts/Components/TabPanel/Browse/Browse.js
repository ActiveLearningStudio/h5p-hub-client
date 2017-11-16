import React from 'react';
import PropTypes from 'prop-types';

import Search from './Search/Search';
import Order from './Order/Order';
import List from './List/List';
import ContentType from './Detail/ContentType';
import NoContentTypesError from './NoContentTypesError/NoContentTypesError';
import search from '../../../utils/search.js';
import Dictionary from '../../../utils/dictionary';

class Browse extends React.Component {
  constructor(props) {
    super(props);

    const defaultOrderBy = 'recently';
    this.state = {
      orderBy: defaultOrderBy,
      contentTypes: search(props.contentTypes, null, defaultOrderBy),
      detailViewActive: false,
      warnOutdated: this.props.contentTypes.outdated
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(state => {
      return {
        contentTypes: search(nextProps.contentTypes, state.filterOn, state.orderBy),
        retrying: undefined
      };
    });
  }

  handleDetailClose = () => {
    this.setState({
      detailViewActive: false,
      setFocus: !this.state.setFocus, // Toggle to trigger focus
    });
  }

  handleOnLibrarySelect = (library) => {
    this.setState({
      library: library,
      detailViewActive: true
    });
  }

  handleFilterOn = (keyword) => {
    // Search for keyword and close detail view if open
    this.setState({
      contentTypes: search(this.props.contentTypes, keyword, this.state.orderBy),
      filterOn: keyword,
      focused: null,
      detailViewActive: false
    });
  }

  handleOrderBy = (property) => {
    this.setState({
      contentTypes: search(this.props.contentTypes, null, property),
      orderBy: property,
      filterOn: '',
      focused: null,
      setFocus: !this.state.setFocus, // Toggle to trigger focus
    });
  }

  handleFocus = (focused) => {
    this.setState({
      focused: focused
    });
  }

  handleFocusMove = (direction) => {
    const focused = this.state.focused || this.state.contentTypes[0];

    for (let i = 0; i < this.state.contentTypes.length; i++) {
      if (focused === this.state.contentTypes[i]) {
        if (this.state.contentTypes[i + direction]) {
          this.setState({
            focused: this.state.contentTypes[i + direction]
          });
        }
        return;
      }
    }
  }

  handleSelect = () => {
    // Use highlighted item
    const selected = this.state.focused || this.state.contentTypes[0];
    if (selected) {
      this.props.onUse(selected);
    }
  }

  handleWarningClose = () => {
    this.setState({
      warnOutdated: false
    });
  }

  handleRetry = () => {
    this.setState({
      retrying: true
    });
    this.props.onReload();
  }

  render() {
    if (!this.props.contentTypes.libraries || !this.props.contentTypes.libraries.length) {
      // No content types available
      return (
        <NoContentTypesError
          throbbing={this.state.retrying}
          details={this.props.error}
          onRetry={this.handleRetry}/>
      );
    }

    return (
      <div className="content-type-section-view loaded">

        <Search value={this.state.filterOn}
          auto={!this.state.detailViewActive}
          setFocus={this.props.setFocus}
          onFilter={this.handleFilterOn}
          onNavigate={this.handleFocusMove}
          onSelect={this.handleSelect}/>

        {
          !!this.state.warnOutdated &&
          <Message
            severity='warning'
            title={Dictionary.get('contentTypeCacheOutdated')}
            message={Dictionary.get('contentTypeCacheOutdatedDesc')}
            onClose={this.handleWarningClose}
          />
        }

        <Order hits={this.state.contentTypes.length}
          selected={this.state.orderBy}
          onChange={this.handleOrderBy}
          hasRecentlyUsed={!!(this.props.contentTypes.recentlyUsed && this.props.contentTypes.recentlyUsed.length)}
          visible={!this.state.detailViewActive}/>

        <div className={'content-type-section' + (this.state.warnOutdated ? ' height-limit' : '')}>
          <List contentTypes={this.state.contentTypes}
            focused={this.state.focused}
            setFocus={!this.state.setFocus}
            visible={!this.state.detailViewActive}
            onUse={this.props.onUse}
            onSelect={this.handleOnLibrarySelect}
            onFocus={this.handleFocus}/>
          <ContentType
            library={this.state.library}
            visible={this.state.detailViewActive}
            onUse={this.props.onUse}
            onClose={this.handleDetailClose}
            getAjaxUrl={this.props.getAjaxUrl}
            onInstall={this.props.onInstall}/>
        </div>
      </div>
    );
  }
}

Browse.propTypes = {
  contentTypes: PropTypes.object.isRequired,
  setFocus: PropTypes.bool,
  getAjaxUrl: PropTypes.func.isRequired,
  onUse: PropTypes.func.isRequired,
  onInstall: PropTypes.func.isRequired
};

export default Browse;
