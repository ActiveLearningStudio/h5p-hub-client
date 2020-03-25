import PropTypes from 'prop-types';
import React from 'react';
import './Filter.scss';
import Modal from 'react-modal';
import variables from '../../../../../../styles/base/_variables.scss';

const screenSmall = parseInt(variables.screenSmall);

class Filter extends React.Component {
  constructor(props) {
    super(props);
    Modal.setAppElement('.reuse-content-result');
    this.state = {
      left: this.calculatePosition()
    };
  }

  componentDidMount() {
    window.addEventListener('click', this.closeModal);
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.closeModal);
    window.removeEventListener('resize', this.handleResize);
  }

  closeModal = () => {
    document.querySelector('.reuse-content-result').removeAttribute('aria-hidden');
    this.props.onFilterClosed(this.props.id);
  }

  getParent = () => {
    return document.querySelector('.reuse-content-result');
  }

  swallowClicks(event) {
    event.stopPropagation();
  }

  /**
   * Calculates the position of the dialog
   * 
   * @returns {integer}
   */
  calculatePosition = () => {
    const filterBar = this.props.filterBarRef.current;
    // Font size of the dialog
    const font = 14.672;
    const filterBarWidth = filterBar.offsetWidth;
    const dialogWidth = font * 40;

    let left = Math.max(this.props.toggleButtonRef.current.offsetLeft - 50, 0);

    // Will dialog overflow? If so, use whatever room we have
    if (left + dialogWidth > filterBarWidth) {
      left = Math.max(filterBarWidth - dialogWidth, 0);
    }
    
    return left;
  }

  /**
   * Handles window resizing
   */
  handleResize = () => {
    this.setState({left: this.calculatePosition()});
  }

  render() {
    const modalAria = { labelledby: this.props.dropdownLabel };

    const style = {
      content: {
        left: this.state.left + 'px'
      }
    };

    return (
      <Modal
        isOpen={true}
        onRequestClose={this.closeModal}
        contentLabel={this.props.id}
        parentSelector={this.getParent}
        className='filter-dialog'
        overlayClassName='lightbox'
        aria={modalAria}
        style={style}
        shouldCloseOnOverlayClick={false}
      >
        <div className="filter-dialog-content" onClick={this.swallowClicks}>
          <div className="header-text">
            {this.props.dictionary.dialogHeader}
          </div>

          {this.props.data && this.props.data.length !== undefined ?
            //The actually checkboxes/filtering
            this.props.children : <div className="loading" />
          }

          <button
            className="apply-filters-button"
            onClick={this.closeModal}
          >
            {this.props.dictionary.dialogButtonLabel}
          </button>
        </div>
      </Modal>
    );
  }
}

Filter.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.array,
  onFilterClosed: PropTypes.func.isRequired,
  checked: PropTypes.array.isRequired,
  handleChecked: PropTypes.func.isRequired,
  dictionary: PropTypes.object.isRequired,
  toggleButtonRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  filterBarRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

export default Filter;
