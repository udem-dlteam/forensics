import React from 'react';
import ButtonGroup from './ButtonGroup';
import StandardContainer from './StandardContainer';

const TabParameter = function (props) {
  const { mainApp, tab, focus } = props;
  const type = mainApp.getPlotType();
  return (
    <div className="">
      {tab.tags.map((x, i) => (
        <StandardContainer
          name={x}
          title={tab.title[i]}
          focus={focus === x}
          allButton={mainApp.state.param[x].multiOption}
          isLocked={mainApp.state.param[x].lock}
          handleAll={mainApp.handleAll}
          handleFold={mainApp.handleFold}
          key={x}
          folded={tab.folded[i]}
          containerIdx={i}
          tabName={tab.name}
          display={(x !== 'baseline' && x !== 'baselineMode')
                                || (type === 'comparator' || type === 'head' || type === 'tail')}
        >
          <ButtonGroup
            mainApp={mainApp}
            param={x}
            options={mainApp.state.param[x].options}
            active={mainApp.state.param[x].active}
            multiOption={mainApp.state.param[x].multiOption}
          />
        </StandardContainer>
      ))}
    </div>
  );
};

export default TabParameter;
