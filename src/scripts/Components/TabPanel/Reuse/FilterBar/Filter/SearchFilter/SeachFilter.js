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
    };
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
  }

  handleSearchClick = () => {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  handleChecked = (filter, checkbox, checkedOf) => {
    this.setState({ setFocus: true });
    this.props.handleChecked(filter, checkbox, checkedOf);
  }



  render() {
    return (
      <div className="search-filter">
        <SearchField
          value={this.state.searchValue}
          onSearch={this.handleOnSearch}
          instantSearch={true}
          auto={true}
          placeholder={this.props.dictionary.searchPlaceholder}
          clearSearch={this.clearSearch}
          onClick={this.handleSearchClick}
          setFocus={this.state.setFocus}
        ></SearchField>
        {this.state.dropdownOpen &&
          <CheckboxList
            onChecked={this.handleChecked}
            items={this.state.checkboxElements}
            checked={this.props.checked}
            filter={this.props.filter}
          />
        }

      </div>
    );
  }

};
SearchFilter.propTypes = {
  items: PropTypes.array,
  handleChecked: PropTypes.func.isRequired,
  checked: PropTypes.array,
  filter: PropTypes.string.isRequired,
  dictionary: PropTypes.object.isRequired
};

export default SearchFilter;