import React from 'react';
import PropTypes from 'prop-types';

import Dictionary from '../../utils/dictionary';

import './LicenseInfo.scss';

const LicenseInfo = ({ id, version, onShowLicenseDetails, attributes, licenseDetailsUrl }) => {
  return (
    <div className='h5p-hub-short-license-info'> {
      id !== 'Unspecified' ? (
        <>
          <h3>{`${id} ${version || ''}`}</h3>

          {
            onShowLicenseDetails 
              ? <button
                type="button"
                className="h5p-hub-short-license-read-more"
                aria-label={Dictionary.get('readMore')}
                onClick={onShowLicenseDetails}>
              </button>
              : licenseDetailsUrl 
                ? <a 
                  className="h5p-hub-short-license-read-more" 
                  aria-label={Dictionary.get('readMore')}
                  href={licenseDetailsUrl}
                  target="_blank"
                />
                : null
          }

          <p>{Dictionary.get("licenseDescription")}</p>

          <ul className="h5p-hub-ul h5p-hub-small">
            { 
              attributes.canHoldLiable !== undefined &&
              <li>
                {Dictionary.get(attributes.canHoldLiable ? "licenseCanHoldLiable" : "licenseCannotHoldLiable")}
              </li>
            }
            {
              attributes.useCommercially &&
              <li>{Dictionary.get("licenseCanUseCommercially")}</li>
            }
            {
              attributes.modifiable &&
              <li>{Dictionary.get("licenseCanModify")}</li>
            }
            {
              attributes.distributable &&
              <li>{Dictionary.get("licenseCanDistribute")}</li>
            }
            {
              attributes.sublicensable &&
              <li>{Dictionary.get("licenseCanSublicense")}</li>
            }
            {
              attributes.mustIncludeCopyright &&
              <li>{Dictionary.get("licenseMustIncludeCopyright")}</li>
            }
            {
              attributes.mustIncludeLicense &&
              <li>{Dictionary.get("licenseMustIncludeLicense")}</li>
            }
          </ul>
        
        </>
      ) : (
        <p>{Dictionary.get("licenseUnspecified")}</p>
      )
    }
    </div>
  );
};

LicenseInfo.propTypes = {
  id: PropTypes.string.isRequired,
  version: PropTypes.string,
  onShowLicenseDetails: PropTypes.func,
  attributes: PropTypes.shape({
    canHoldLiable: PropTypes.bool,
    useCommercially: PropTypes.bool,
    modifiable: PropTypes.bool,
    distributable: PropTypes.bool,
    sublicensable: PropTypes.bool,
    mustIncludeCopyright: PropTypes.bool,
    mustIncludeLicense: PropTypes.bool
  }),
  licenseDetailsUrl: PropTypes.string
};

export default LicenseInfo;
