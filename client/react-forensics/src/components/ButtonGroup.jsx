import React, { PureComponent } from 'react';
import InputButton from './InputButton';

class ButtonGroup extends PureComponent {
  render() {
    const {
      mainApp, param, options, active, multiOption,
    } = this.props;
    const parentStyle = 'd-flex flex-row flex-wrap d-table parent-btn ';

    return (
      <div
        className={parentStyle}
        data-toggle="buttons"
      >
        {options.map((x, i) => {
          const isActive = multiOption ? active[i]
            : active === i;

          return (
            <InputButton
              value={options[i]}
              id={i}
              key={param + options[i]}
              name={param}
              onClick={mainApp.handleChange}
              smallGrid={options.length > 12}
              isActive={isActive}
              group={param === 'baseline' ? mainApp.getSeries() : param}
            />
          );
        })
        }
      </div>
    );
  }
}

export default ButtonGroup;
