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
      checkedParents: [],
      parent: [],
    };

    this.searchRef = React.createRef();
    this.searchList = []; //List of elements that can be checked on or off and that are not a category
    this.allParents = [];

    this.parents = [];
    this.checkboxRefs = {};
    this.listRefId = 'list';
    this.checkboxRefs[this.listRefId] = React.createRef();

    this.getParents(this.props.items);

    this.parents.forEach(parent => this.checkboxRefs[parent.id] = React.createRef());
    this.searchList.forEach(checkbox => this.checkboxRefs[checkbox.id] = React.createRef());
  }

  /**
   * Set the right parents to checked
   */
  componentDidMount() {
    this.setParentsChecked();
  }

  componentWillUnmount() {
    this.setState({
      parent: [],
      focused: null
    });
  }

  handleClearSearch = () => {
    this.setState({
      checkboxElements: this.props.items.sort(this.compare),
      searchValue: ''
    });
    this.searchRef.current.focus();
  }

  handleOnSearch = (value) => {
    if (value == '') {
      this.handleClearSearch();
    }
    else {
      const list = this.searchList && this.searchList
        .filter(element => RegExp(value.toUpperCase()).test(element.label.toUpperCase())).sort(this.compare);
      this.setState({
        checkboxElements: list,
        searchValue: value,
        dropdownOpen: true,
        parent: [],
      });
    }
  };

  /**
   * Open dropdown when searchfilter is clicked on
   */
  handleSearchClick = () => {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  handleChecked = (filter, checkbox, checkedOf) => {
    if (!this.state.dropdownOpen) {
      this.setState({ dropdownOpen: true }); //TODO find out if this is needed when it opens on focus
    }
    else if (checkbox && this.state.checkboxElements[this.indexOfId(checkbox)]) {
      this.setState({ setFocus: true, focused: checkbox });
      const children = this.state.checkboxElements[this.indexOfId(checkbox)].children;

      //The checkbox is a cateqgory and all it's children should either be checked on or off.
      if (children) {
        this.setParentsChecked(this.getChildren(this.getParentFromId(checkbox)).map(element => element.id), checkedOf);
        this.props.handleChecked(filter, this.getChildren(this.getParentFromId(checkbox)).filter(element => this.getParentFromId(element.id) ===null).map(element => element.id), checkedOf);
      }
      else {
        this.setParentsChecked(checkbox, checkedOf);
        this.props.handleChecked(filter, checkbox, checkedOf);
      }
      this.searchRef.current.focus();
    }
  }

  /**
   * Goes through all parents and set thoose that has checked children as checked
   * Has checkbox has input to have the right collection as checked checkboxes
   * @param  {string || Object[]} checkbox
   * @param  {boolean} checkedOf
   */
  setParentsChecked = (checkbox, checkedOf) => {
    const checkedParents = [];
    let checked = null;
    if (Array.isArray(checkbox)) {
      checked = checkedOf ? this.props.checked.filter(element => checkbox.indexOf(element) === -1).concat(checkbox).concat(this.state.checkedParents)
        : this.props.checked.filter(id => checkbox.indexOf(id) === -1);
    } else {
      checked = checkedOf ? this.props.checked.concat([checkbox].concat(this.state.checkedParents)) : this.props.checked.filter(element => element !== checkbox);
    }
    checked.filter(checkbox => this.getParentFromId(checkbox) ===null);
    this.parents.forEach(parent => this.checkedOf(this.getChildren(parent), checked) ? checkedParents.push(parent.id) : {});
    this.setState({ checkedParents: checkedParents });
  }

  /**
   * Finds next element to be focused and scroll it into view if necessary
   * @param  {number} direction
   */
  handleNavigateVertical = (direction) => {
    const index = this.indexOfId(this.state.focused) + direction;
    const sibling = this.state.checkboxElements[index];

    if (this.state.dropdownOpen && index !== this.state.checkboxElements.length && sibling === undefined) {
      this.setState({ focused: this.state.checkboxElements.map(element => element.id)[0] });

      this.checkboxRefs[this.listRefId].current.scrollTop = 0;
    }

    else if (this.state.dropdownOpen && index != this.state.checkboxElements.length) {
      this.setState({ focused: sibling.id });

      const listHeight = this.checkboxRefs[this.listRefId].current.offsetHeight;
      const scrolltop = (index + 1) * this.checkboxRefs[this.state.checkboxElements[0].id].current.offsetHeight - listHeight;
      this.checkboxRefs[this.listRefId].current.scrollTop = scrolltop;
    }
  }

  /**
   * Navigate to children or to the first level according to direction
   * @param  {number} direction 1 or -1
   */
  handleNavigateSideway = (direction) => {
    if (this.state.dropdownOpen && direction == -1 && this.state.parent) {
      this.navigateToParent();
    } else if (this.state.dropdownOpen && direction == 1 && this.state.focused && this.getChildren(this.getParentFromId(this.state.focused))) {
      this.navigeteToChildren(this.state.focused, this.getParentFromId(this.state.focused).children);
    }
  }

  /**
   * Navigate to the leafes of the id
   * @param  {string} id
   * @param  {array} children
   */
  navigeteToChildren = (id, children) => {
    this.setState({
      checkboxElements: children,
      parent: [...this.state.parent, id],
    });
    this.searchRef.current.focus();
  }

  /**
   * Navigate to the initial level 
   */
  navigateToParent = () => {
    const parent = this.state.parent[this.state.parent.length -2];
    const checkboxElements = this.getParentFromId(parent) && this.getParentFromId(parent).children;
    const newParent = this.state.parent;
    newParent.pop();
    this.setState({ parent: newParent, checkboxElements: checkboxElements ? checkboxElements : this.props.items.sort(this.compare), focused: this.state.parent[0] });
    this.searchRef.current.focus();
  }

  /**
   * Compares to inputs alphabetically according to label
   * @param  {object} a
   * @param  {object} b
   */
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

  /**
   * If id, returns all children of this element.
   * If no id, return all leaf nodes 
   * @param  {string} id an id can be supplied
   * @return {array, bool}
   */
  getChildren = (parent) => { //Rename to descendandts or something like that
    if (parent === null) {
      return [];
    }
    const children = [];
    const list = [parent];
    while (list.length > 0) {
      const element = list.pop();
      if (element && element.children) {
        children.concat(element.children);
        element.children.forEach(
          element => {
            children.push(element);
            list.push(element);
          }
        );
      }
    }
    return children;
  }

  recursionExample = (list, number) => {
    const newList = list;
    if (number == 1) {
      return list;
    } else {
      return this.recursionExample(newList.concat([number]), number - 1);

    }
  }

  getParentFromId = (id) => {
    for (let i = 0; i < this.parents.length; i++) {
      if (this.parents[i].id === id) {
        return (this.parents[i]);
      }
    }
    return null;
  }

  getParents = (childrenList) => {
    for (let i = 0; i < childrenList.length; i++) {
      const element = childrenList[i];
      if (element.children) {
        this.parents.push(element);
        this.getParents(element.children);
      } else {
        this.searchList.push(element);
      }

    }
  }

  /**
   * Checks if a list has any checked of or if an element is checked of
   * @param  {array || string} element 
   * @returns {boolean}
   */
  checkedOf(element, checked) {
    if (Array.isArray(element) && checked) {
      return checked ? element.filter(element => checked.indexOf(element.id) !== -1).length > 0 : false;
    } else {
      return this.props.checked.indexOf(element) != -1 || this.state.checkedParents.indexOf(element) !== -1;
    }
  }

  /**
   * Index of an id in the currently checkboxelements
   * @param  {string} id
   * @returns {string}
   */
  indexOfId = (id) => {
    return this.state.checkboxElements.map(element => element.id).indexOf(id);
  }

  render() {
    return (
      <div className="search-filter">
        <SearchField
          ref={this.searchRef}
          value={this.state.searchValue}
          onSearch={this.handleOnSearch}
          placeholder={this.props.dictionary.searchPlaceholder}
          onClick={this.handleSearchClick}
          onNavigateVertical={this.handleNavigateVertical}
          onSelect={() => this.handleChecked(this.props.filter, this.state.focused, !(this.checkedOf(this.state.focused)), this.state.parent[this.state.parent.length-1])}
          onNavigateSideway={this.handleNavigateSideway}
        ></SearchField>
        {this.state.parent.length > 0 && this.state.dropdownOpen &&
          <button onClick={this.navigateToParent} className='navigate-parent'>
            {this.getParentFromId(this.state.parent[this.state.parent.length - 1]).label}
          </button>
        }
        {this.state.searchValue.length > 0
          && <button onClick={this.handleClearSearch} className="clear-button" />
        }
        {this.state.dropdownOpen && this.props.items &&
          <CheckboxList
            onChecked={this.handleChecked}
            items={this.state.checkboxElements}
            checked={this.props.checked.concat(this.state.checkedParents)}
            checkedParents={this.state.checkedParents}
            filter={this.props.filter}
            focused={this.state.focused}
            navigateToChildren={this.navigeteToChildren}
            parent={this.state.parent[this.state.parent.length - 1]}
            ref={this.checkboxRefs}
            listRefId={this.listRefId}
            getChildren={this.getChildren}
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
  dictionary: PropTypes.object.isRequired,
};

export default SearchFilter;