import React, { PureComponent } from 'react';

class StandardContainer extends PureComponent {
  getMessage(name) {
    if (name === 'baseline') {
      return ' Baseline mode is set to automatic. Selected baseline options will match the option or options right before the selected option or options in the main variable menu. Please set baseline mode to \'Manual\' for custom selection.';
    }
    return ' This option is unavailable because of selected plot type.';
  }

  getLockMessage(name) {
    return (
      <div className="rounded-0 warning-message">
        <b> Warning!</b>
        {this.getMessage(name)}
      </div>
    );
  }

  getAllButton(handleAll, name) {
    return (
      <button
        type="button"
        className="btn btn-primary rounded-0 btn-sm left-button"
        name={name}
        onClick={handleAll}
      >
        All
      </button>
    );
  }

  getFoldButton() {
    const {
      folded, handleFold, containerIdx, tabName,
    } = this.props;
    return (
      <button
        type="button"
        className={`btn rounded-circle right-button btn-${
          folded ? 'success' : 'warning'}`}
        name={tabName}
        id={containerIdx}
        onClick={handleFold}
      >
        {folded ? '+' : '-'}
      </button>
    );
  }

  render() {
    const {
      name, title, focus, allButton,
      handleAll, children, folded, isLocked, display,
    } = this.props;
    const cardBody = (
      <div className={`card-body ${
        folded ? 'd-none' : ''}`}
      >
        {isLocked ? this.getLockMessage(name) : null}
        {children}
      </div>
    );

    return (
      <div className={`card rounded-0 bg-dark ${
        display ? '' : 'd-none'}`}
      >
        <div className="card-header text-center white bold">
          <span className={focus ? 'underline' : ''}>{title}</span>
          {allButton ? this.getAllButton(handleAll, name) : null}
          {this.getFoldButton()}
        </div>
        {cardBody}
      </div>
    );
  }
}

export default StandardContainer;
