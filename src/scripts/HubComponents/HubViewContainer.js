import React from 'react';
import DropDownSelector from './DropDownSelector/DropDownSelector';
import BrowseTabs from './BrowseTabs';

class HubViewContainer extends React.Component {

  componentDidUpdate() {
    this.props.resize();
  }

  render() {
    let sectionId = 'content-types';
    const panelClasses = 'panel' + (this.props.isExpanded ? ' open' : '');

    return (
      <section className="h5p-hub h5p-sdk">
        <div className={panelClasses}>
          <DropDownSelector
            title={this.props.title}
            sectionId={sectionId}
            isExpanded={this.props.isExpanded}
            togglePanel={this.props.togglePanel}
          />
          <div id={`panel-body-${sectionId}`} role="region" className={this.props.isExpanded ? '' : 'hidden'}>
            <BrowseTabs tabConfigs={this.props.tabConfigs}/>
          </div>
        </div>
      </section>
    );
  }
}

export default HubViewContainer;