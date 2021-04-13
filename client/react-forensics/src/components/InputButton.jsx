import React, { PureComponent } from 'react';

import { stringFormat } from '../../../forensics-plot/build/forensics-plot';

class InputButton extends PureComponent {
  render() {
    const {
      name, group, smallGrid, isActive, onClick, value, id,
    } = this.props;
    const inputStyle = `btn rounded-0 btn-outline-secondary shadow-none ${
      smallGrid ? 'btn-grid ' : 'btn-double '}${isActive ? 'active' : ''}`;
    return (
      <React.Fragment>
        <input
          type="button"
          value={stringFormat(value, group)}
          id={id}
          name={name}
          onClick={onClick}
          className={inputStyle}
        />
      </React.Fragment>
    );
  }
}

export default InputButton;
