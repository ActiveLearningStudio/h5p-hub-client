import React from 'react';
import Accordion from '../../GenericComponents/Accordion/Accordion';
import License from './License';
import Dictionary from '../../utils/dictionary';
import './LibraryAccordion.scss';

class LibraryAccordion extends React.Component {
  render() {
    return (
      <Accordion>
        <License
          header={Dictionary.get('contentTypeLicensePanelTitle')}
          id={this.props.id}
          attributes={this.props.attributes}
          /*onShowLicenseDetails={this.props.onShowLicenseDetails.bind(this)}*/
        />
      </Accordion>
    );
  }
}

export default LibraryAccordion;
