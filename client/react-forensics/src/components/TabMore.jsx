import React, { Component } from 'react';
import StandardContainer from './StandardContainer';
import PresetManager from './PresetManager';
import Help from './Help';

class TabMore extends Component {
  getChildren(name) {
    const { mainApp } = this.props;
    switch (name) {
      case 'Manage Presets':
        return (
          <PresetManager
            mainApp={mainApp}
            saveNameValid={mainApp.state.saveNameValid}
          />
        );
      case 'Help':
        return <Help />;
      default:
        return null;
    }
  }

  render() {
    const { tab, focus, mainApp } = this.props;
    return (
      <React.Fragment>
        {tab.tags.map((x, i) => (
          <StandardContainer
            name={x}
            title={tab.title[i]}
            focus={x === focus}
            allButton={false}
            isLocked={false}
            handleAll={mainApp.handleAll}
            handleFold={mainApp.handleFold}
            key={x}
            folded={tab.folded[i]}
            containerIdx={i}
            tabName={tab.name}
            display
          >
            {this.getChildren(x)}
          </StandardContainer>
        ))}
      </React.Fragment>
    );
  }
}

export default TabMore;
