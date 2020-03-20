import React from 'react';
import PropTypes from 'prop-types';
import './CheckboxList.scss';
import Checkbox from '../Checkbox/Checkbox';

const CheckboxList = ({ items, onChecked, checked, filter, focused })=> {

  const isChecked = (id) => {
    return checked.indexOf(id) != -1;
  };

  return (
    <ul
      className="checkbox-list"
      id='checkbox-list'
      role='group'
      aria-labelledby={filter.label}>

      {items.map(element => {
        return (
          <Checkbox
            key={element.id}
            id={element.id}
            label={element.label}
            checked={isChecked(element.id)}
            filter={filter}
            onChecked={onChecked}
            focused={focused == element.id}
          />
        );
      })}
    </ul>
  );
};
CheckboxList.propTypes = {
  items: PropTypes.array.isRequired,
  onChecked: PropTypes.func.isRequired,
  checked: PropTypes.array,
  filter: PropTypes.string.isRequired,
  focused: PropTypes.string
};

export default CheckboxList;