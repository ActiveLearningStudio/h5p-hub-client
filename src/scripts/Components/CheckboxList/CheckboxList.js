import React from 'react';
import PropTypes from 'prop-types';
import './CheckboxList.scss';
import Checkbox from '../Checkbox/Checkbox';

const CheckboxList = React.forwardRef(({
  items,
  onChecked,
  checked, filter,
  focused,
  navigateToChildren,
  parent,
  listRefId,
  tabIndex }, ref) => {

  /**
   * Check if a checkbox is in list of the checked checkboxes
   * @param  {string} id
   */
  const isChecked = (id) => {
    return checked.indexOf(id) != -1;
  };

  const childrenChecked = (children) => {
    return children ? children.filter(element => isChecked(element.id)).length : null;
  };

  return (
    <ul
      className="checkbox-list"
      id='checkbox-list'
      role='group'
      aria-labelledby={filter.label}
      ref={ref && ref[listRefId]}>

      {items.map(element => {
        return (
          <Checkbox
            key={parent + element.id}
            id={element.id}
            label={element.label}
            checked={isChecked(element.id)}
            filter={filter}
            onChecked={onChecked}
            focused={focused == element.id}
            children={element.children}
            navigateToChildren={navigateToChildren}
            parent={parent}
            childrenChecked={childrenChecked(element.children) > 0 && childrenChecked(element.children)}
            ref={ref && ref[element.id]}
            tabIndex={tabIndex}
          />
        );
      })}
    </ul>
  );
});
CheckboxList.propTypes = {
  items: PropTypes.array,
  onChecked: PropTypes.func.isRequired,
  checked: PropTypes.array,
  filter: PropTypes.string.isRequired,
  focused: PropTypes.string,
  navigateToChildren: PropTypes.func,
  parent: PropTypes.string,
  listRefId: PropTypes.string,
  tabIndex: PropTypes.string
};

export default CheckboxList;