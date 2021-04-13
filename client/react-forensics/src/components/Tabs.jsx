import React, { Component } from 'react';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import TabParameter from './TabParameters';
import TabMore from './TabMore';
import PresetList from './PresetList';

class Tabs extends Component {
  componentDidUpdate() {
    const { mainApp } = this.props;
    // Options will be cached if param or tab changed (see
    // shouldComponentUpdate)
    mainApp.cache();

    // Blur A (targeting the tab-navs) components to avoid shortcut conflicts
    // with the react-bootstrap tabs
    if (document.activeElement.nodeName === 'A'
    || document.activeElement.nodeName === 'BUTTON') {
      document.activeElement.blur();
    }
  }

  render() {
    const { mainApp, activeTab, tabs } = this.props;
    return (
      <Tab.Container
        defaultActiveKey={activeTab}
        activeKey={activeTab}
        onSelect={mainApp.setActiveTab}
      >
        <Row noGutters className="tab-fixed">
          <Nav className="w-100 flex-row">
            <Nav.Item className="top-tab">
              <Nav.Link eventKey="tags">Variables</Nav.Link>
            </Nav.Item>
            <Nav.Item className="side-border">
              <Nav.Link eventKey="options">Plot</Nav.Link>
            </Nav.Item>
            <Nav.Item className="side-border">
              <Nav.Link eventKey="load">More</Nav.Link>
            </Nav.Item>
            <div id="presetListParent">
              <PresetList
                presetList={mainApp.state.saves}
                loadSave={mainApp.loadSave}
              />
            </div>
          </Nav>
        </Row>
        <Row noGutters>
          <Tab.Content className="w-100">
            <Tab.Pane eventKey="tags">
              <TabParameter
                mainApp={mainApp}
                tab={tabs.tags}
                focus={mainApp.getFocus('tags')}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="options">
              <TabParameter
                mainApp={mainApp}
                tab={tabs.options}
                focus={mainApp.getFocus('options')}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="load">
              <TabMore
                mainApp={mainApp}
                tab={tabs.load}
                focus={mainApp.getFocus('load')}
              />
            </Tab.Pane>
          </Tab.Content>
        </Row>
      </Tab.Container>
    );
  }
}

export default Tabs;
