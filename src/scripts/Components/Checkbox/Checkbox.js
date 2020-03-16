import React from 'react';
import PropTypes from 'prop-types';
import './Checkbox.scss';

const Checkbox = ({ id, label, checked, filter, onChecked }) => {

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key == ' ') {
      onChecked(filter, id, !checked);
    }
  };

  return (
    <li
      id={id}
      key={id}
      className={`checkbox ${checked ? 'checked' : 'unChecked'}`}
      role='checkbox'
      aria-checked={checked}
      onClick={() => onChecked(filter, id, !checked)}
      tabIndex='0'
      onKeyDown={handleKeyDown}>
      <div className='content' key={'label' + id} >
        <div className='label-text'>
          {label}
        </div>
      </div>
    </li>
  );
};

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChecked: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
  filter: PropTypes.string.isRequired,
};

export default Checkbox;