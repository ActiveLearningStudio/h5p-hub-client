import React from 'react';
import PropTypes from 'prop-types';
import CheckboxList from '../../../../../CheckboxList/CheckboxList';
import SearchField from './SearchField/SearchField';

import './SearchFilter.scss';

class SearchFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkboxElements: this.props.items.sort(this.compare),
      searchValue: '',
      dropdownOpen: false,
      setFocus: false,
      focused: null,

    };
    this.searchRef = React.createRef();
  }

  compare = (a, b) => {
    let nameA = a.label.toUpperCase();
    let nameB = b.label.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
  }
  search = (list, value) => {
    return list
      .sort(this.compare)
      .filter(element => RegExp(value.toUpperCase()).test(element.label.toUpperCase()));
  }

  handleOnSearch = (value) => {
    this.setState({
      checkboxElements: this.search(this.props.items, value),
      searchValue: value,
      dropdownOpen: true
    });
  };

  clearSearch = () => {
    this.setState({
      checkboxElements: this.props.items.sort(this.compare),
      searchValue: ''
    });
    this.searchRef.current.focus();
  }

  handleSearchClick = () => {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  handleChecked = (filter, checkbox, checkedOf) => {
    if (!this.state.dropdownOpen) {
      this.setState({ dropdownOpen: true });
    }
    else {
      this.setState({ setFocus: true, focused: checkbox });
      const children = this.state.checkboxElements[this.indexOfId(checkbox)].children;
      if (children) {
        children.forEach(child => {
          this.props.handleChecked(filter, child.id, checkedOf);
        });
      } else {
        this.props.handleChecked(filter, checkbox, checkedOf);
      }
      this.searchRef.current.focus();
    }
  }

  indexOfId = (id) => {
    return this.state.checkboxElements.map(element => element.id).indexOf(id);
  }

  handleKeyEvent = (direction) => {
    const index = this.indexOfId + direction;
    const sibling = this.state.checkboxElements[index];
    if (sibling == undefined) {
      this.setState({ focused: this.state.checkboxElements.map(element => element.id)[0] });
    } else {
      this.setState({ focused: sibling.id });
    }
  }

  checkedOf(id) {
    return this.props.checked.indexOf(id) != -1;
  }

  render() {

    return (
      <div className="search-filter">
        <SearchField
          ref={this.searchRef}
          value={this.state.searchValue}
          onSearch={this.handleOnSearch}
          instantSearch={true}
          auto={true}
          placeholder={this.props.dictionary.searchPlaceholder}
          clearSearch={this.clearSearch}
          onClick={this.handleSearchClick}
          setFocus={this.state.setFocus}
          onNavigate={this.handleKeyEvent}
          onSelect={() => this.handleChecked(this.props.filter, this.state.focused, !this.checkedOf(this.state.focused))}
        ></SearchField>
        {this.state.searchValue.length > 0
          && <button onClick={this.clearSearch} className="clear-button" />
        }
        {this.state.dropdownOpen &&
          <CheckboxList
            onChecked={this.handleChecked}
            items={this.state.checkboxElements}
            checked={this.props.checked}
            filter={this.props.filter}
            focused={this.state.focused}
          />
        }

      </div>
    );
  }
}

SearchFilter.propTypes = {
  items: PropTypes.array,
  handleChecked: PropTypes.func.isRequired,
  checked: PropTypes.array,
  filter: PropTypes.string.isRequired,
  dictionary: PropTypes.object.isRequired
};

export default SearchFilter;