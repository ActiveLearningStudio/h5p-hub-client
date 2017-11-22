import React from 'react';
import PropTypes from 'prop-types';
import noIcon from '../../../../../../images/content-type-placeholder.svg';
import Dictionary from '../../../../../utils/dictionary';

import './ListItem.scss';

const ListItem = ({ contentType, tabindex, onSelect }) => {
  const title = contentType.title || contentType.machineName;
  const updateAvailable =
    !contentType.isUpToDate && contentType.installed && contentType.canInstall;

  const handleSelect = event => {
    onSelect(contentType);
    event.preventDefault();
  };

  const handleKeyDown = event => {
    if (event.which === 13 || event.which === 32) {
      handleSelect(event);
    }
  };

  return (
    <div>
      <div className="media-left">
        <img
          className="media-object"
          src={contentType.icon || noIcon}
          alt={title + ' ' + Dictionary.get('contentTypeIconAltText')}
        />
      </div>

      <div className="media-body">
        <div className="h4 media-heading">{title}</div>

        {contentType.installed ? (
          <button
            type="button"
            className="button button-primary"
            tabIndex={tabindex}
            onClick={handleSelect}
            onKeyDown={handleKeyDown}
          >
            {Dictionary.get('contentTypeDetailButtonLabel')}
          </button>
        ) : (
          <button
            type="button"
            className="button button-inverse-primary button-install"
            tabIndex={tabindex}
          >
            {Dictionary.get('contentTypeGetButtonLabel')}
          </button>
        )}

        <div
          className={
            'content-type-update-info' + (updateAvailable ? '' : ' hidden')
          }
        >
          {Dictionary.get('contentTypeUpdateAvailable')}
        </div>

        <div className="description">{contentType.summary || ''}</div>
      </div>
    </div>
  );
};

ListItem.propTypes = {
  contentType: PropTypes.object.isRequired,
  tabindex: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ListItem;
