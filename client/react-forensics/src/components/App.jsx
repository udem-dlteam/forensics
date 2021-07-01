// React
import React, { Component } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// CSS
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
// React-bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// Components
import NavBar from './Navbar';
import MetaWindow from './MetaWindow';
import PlotViewer from './PlotViewer';
import Tabs from './Tabs';
// Functional components
import { handleShift, onKeyDown, onKeyUp } from '../func/keyHandlers';
import { savePresets } from '../func/savePresets';
import {
  compatibleWithCurrent,
  defaultSave,
  getFirstSave,
} from '../func/saveManaging';

// forensics-plot
import { PlotGenerator } from '../../../forensics-plot/build/forensics-plot';

const DEFAULT_API_URL = "./api"
const loaderData = new Map();

/*
const fetchData = (api_url) => {
  return fetch(api_url + "/systems", {
    mode: 'cors',
    method: 'GET'
  }).then(x => x.json()).then((systems)=> {
    let promises = []
    for(name of systems.names){
      let url = api_url + "/systems/" + name;

      promises.push(fetch(url, {
        mode: 'cors',
        method: 'GET'
      }).then(x => x.json()).then(data => loaderData.set(data.name, data)))
    }

    return Promise.all(promises)
  })
}
*/

const fetchData = (api_url) => {
  return fetch(api_url + "/legacy/", {
    mode: 'cors',
    method: 'GET'
  }).then(x => x.json()).then((data_list)=> {
    for(var data of data_list){
      loaderData.set(data.name, data)
    }
    
  })
} 

// Functions
// Function needed for splash page
const fade = function (element) {
  setTimeout(() => {
    element.style.WebkitTransition = 'visibility .5s, opacity .5s';
    element.style.opacity = '0';
    element.style.visibility = 'hidden';
  }, 1250);
};
// Configue the possibility to use toasts to render alerts
toast.configure({
  autoClose: 2000,
});

class App extends Component {
  // Lifecycle methods

  constructor(props) {
    super(props);

    // Set state
    this.state = {
      loading:true
    };

    // Bind methods
    this.getPresetParam = this.getPresetParam.bind(this);
    this.setActiveTab = this.setActiveTab.bind(this);
    this.handleFold = this.handleFold.bind(this);
    this.goToHelp = this.goToHelp.bind(this);
    this.loadSave = this.loadSave.bind(this);
    this.flushLocal = this.flushLocal.bind(this);
    this.handlePlotHover = this.handlePlotHover.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handlePlotClick = this.handlePlotClick.bind(this);
    this.handleAll = this.handleAll.bind(this);
  }

  componentDidMount() {
    const url = new URL(window.location.href);
    const preset = url.searchParams.get('p');
    const commit = url.searchParams.get('c');
    const clear = url.searchParams.get('clearLocal');
    const backendUrl = url.searchParams.get("apiurl") || DEFAULT_API_URL;

    fetchData(backendUrl).then(()=> {
      // Get URL and preset
      

      // Clear local storage via URL
      if (clear === 'true') localStorage.clear();

      // Holds value of modifier keys
      this.ctrl = false;
      this.shift = false;

      // PlotGenerator returns a plotly figure based on its parameters
      // Figure is then passed as props to the plot component
      // (see render method).
      //fetchData()
      this.pg = new PlotGenerator(loaderData);

      // Get formatSave from localStorage
      // Save contains previous param, tab info and activeTab
      const save = getFirstSave(this, preset, commit);

      // ActiveTab holds the name of the currently displayed tab
      const { activeTab } = save;

      // Link to hovered meta
      this.link = '';

      // Parameters holds selected options for all variables and plot settings
      const { param } = save;
      this.pg.setAllParameters(save.param, true);

      // Get first figure
      const figure = this.pg.getFigure();

      // Tabs hold every tab's layout and a pointer
      // to the current active container in each tab
      const { tabs } = save;

      // Meta object : contains meta information on the hovered point
      const meta = this.getEmptyMeta();

      // Boolean indicating if input for saveName is valid
      const saveNameValid = true;

      // Saves currently in local storage for display
      const saves = Object.keys(localStorage);

      // Set state
      this.setState({
        loading:false,
        error:false,
        param,
        figure,
        tabs,
        meta,
        saves,
        saveNameValid,
        activeTab,
      });

      
      this.setFirstMeta(activeTab);

    }).catch((e) => {
      this.setState({
        error: "Cannot find a valid api at " + backendUrl + ". Try using another apiurl by specifiying it as an argument in the URL. For exemple : localhost:3000/?apiurl=http://exemple.com:3002",
        loading: false
      })
    })
    

    // Key listeners
    document.addEventListener('keydown', e => onKeyDown(e, this));
    document.addEventListener('keyup', e => onKeyUp(e, this));

  }

  componentDidUpdate(prevProps, prevState) {
    const { activeTab } = this.state;

    // Cache options if tab changed
    if (!(prevState.activeTab === activeTab)) this.cache();
  }

  // Getters
  getCurrentFocus() {
    const { activeTab } = this.state;
    return this.getFocus(activeTab);
  }

  getFocus(tabName) {
    const { tabs } = this.state;
    return tabs[tabName].tags[tabs[tabName].active];
  }

  getX() {
    // Returns name of the variable currently used as the x-axis
    const { param } = this.state;
    return param.x.options[param.x.active];
  }

  getPlotType() {
    // Returns name of the plott type currently used
    const { param } = this.state;
    return param.type.options[param.type.active];
  }

  getSeries() {
    const { param } = this.state;
    return param.series.options[param.series.active];
  }

  getPresetParam(presetName = 'Default', commit) {
    this.pg.loadPreset(presetName, commit);
    const def = this.pg.getParameters();
    Object.keys(def).forEach((x) => {
      def[x].anchor = { from: 0, to: 0 };
    });
    return def;
  }

  // Metas handling
  getEmptyMeta() {
    return { title: '', body: [] };
  }

  formatMeta(string) {
    const sp = string.split('\n');
    const meta = {};
    [meta.title] = sp;
    meta.body = sp.slice(1, -1);
    this.link = sp[sp.length - 1];
    return meta;
  }

  setFirstMeta(activeTab) {
    const { param } = this.state;
    if (activeTab === 'load') return;
    const focus = this.getFocus(activeTab);

    const x = this.getX();
    let name;

    if (param[focus].hasMeta) {
      name = focus;
    } else if (param[x].hasMeta) {
      name = x;
    } else {
      // If focus or x do not have meta, return
      return;
    }

    const target = param[name].active;
    for (let i = target.length - 1; i > -1; i -= 1) {
      if (target[i]) {
        this.setMeta(name, i);
        break;
      }
    }
  }

  setMeta(name, id) {
    // Handler when id is known. For plot hovering, refer to handlePlotHover
    const { param } = this.state;
    let { meta } = this.state;

    // Display meta information
    if (param[name].hasMeta) meta = this.formatMeta(param[name].metas[id]);

    this.setState({ meta });
  }

  // Tabs
  setActiveContainer(name) {
    // Should be called when user clicks on a container
    // Used to keep track of target container when shortcuts are used
    const { tabs, activeTab } = this.state;

    // Update active
    tabs[activeTab].active = tabs[activeTab].tags.indexOf(name);

    this.setState({ tabs });
  }

  setActiveTab(key) {
    this.setState({ activeTab: key });
  }

  setFold(tabName, containerId) {
    const { tabs } = this.state;
    const current = tabs[tabName].folded[containerId];
    tabs[tabName].folded[containerId] = !current;
    this.setState({ tabs });
  }

  handleFold(event) {
    const { tabs } = this.state;
    this.setFold(event.target.name, +event.target.id);
    this.setActiveContainer(tabs[event.target.name]
      .tags[+event.target.id]);
  }

  setAllFold(bool) {
    const { tabs } = this.state;
    Object.keys(tabs).forEach((x) => {
      tabs[x].folded = new Array(tabs[x].folded.length).fill(bool);
    });
    this.setState({ tabs });
  }

  goToHelp() {
    const { tabs } = this.state;

    // Go to 'More' tab
    this.setActiveTab('load');

    // Unfold
    const idx = tabs.load.tags.indexOf('Help');
    tabs.load.folded[idx] = false;

    // Set active
    tabs.load.active = idx;

    this.setState({ tabs });
  }

  updateAnchors(name, from, to) {
    const { param } = this.state;
    param[name].anchor.from = from;
    param[name].anchor.to = to;
    this.setState(param);
  }

  // Presets
  loadSave(name) {
    const save = JSON.parse(localStorage.getItem(name));
    if (save === null) {
      console.log('Please use an existing preset name.');
      return false;
    }

    if (compatibleWithCurrent(save, defaultSave(this.pg.getParameters()))) {
      const { tabs, activeTab } = save;
      let { param } = save;
      // Set all plot generator parameters and retrieve the object (PG has
      // internal checks to ensure setting compatibility)
      this.pg.setAllParameters(param, true);
      param = this.pg.getParameters();

      this.setParam('load', param);
      this.setState({ activeTab });
      this.repositionBaseline(param.series.options[param.series.active], tabs);

      this.setFirstMeta(activeTab);
    } else {
      this.flushLocal();
    }

    return true;
  }

  saveParam(name) {
    const { tabs, param, activeTab } = this.state;

    const save = {
      tabs,
      param,
      activeTab,
      presetName: null,
    };

    localStorage.setItem(name, JSON.stringify(save));

    // Update saves for display
    const saves = Object.keys(localStorage);
    this.setState({ saves });
  }

  validateSaveName(saveName) {
    const saveNameValid = !Object.keys(localStorage).includes(saveName);
    this.setState({ saveNameValid });
  }

  flushLocal() {
    localStorage.clear();

    // Regenerate presets and cache current config
    savePresets(this);
    this.cache();

    const saves = Object.keys(localStorage);
    this.setState({ saves });
  }

  cache() {
    const { tabs, param, activeTab } = this.state;

    // Save parameters, tabs and activeTab on each update
    const save = {
      tabs,
      param,
      activeTab,
      presetName: 'cache',
    };
    localStorage.setItem('cache', JSON.stringify(save));
  }

  // Plot interaction
  handlePlotHover(event) {
    let { meta, figure } = this.state;
    const { pointIndex } = event.points[0];

    // Metas are packaged in the figure object
    const metaPoint = figure.metas[pointIndex];

    if (metaPoint !== null) {
      meta = this.formatMeta(metaPoint);
    }

    this.setState({ meta });
  }

  handlePlotClick() {
    const { param } = this.state;
    if (param[this.getX()].hasMeta && this.ctrl) {
      window.open(this.link, '_blank');
    }
  }

  // Baseline handling
  repositionBaseline(seriesName, tabs = this.state.tabs) {
    // Handle baseline position
    // const { tabs } = this.state;
    let seriesIdx = tabs.tags.tags.indexOf(seriesName);
    const baseIdx = tabs.tags.tags.indexOf('baseline');
    // Save currently active container
    const active = tabs.tags.tags[tabs.tags.active];
    if (baseIdx !== seriesIdx + 2) {

      // If baseline mode and baseline are not right after sibling container,
      // reorder

      // Extract all baseline related information
      tabs.tags.tags.splice(baseIdx - 1, 2);
      tabs.tags.title.splice(baseIdx - 1, 2);
      const folded = tabs.tags
        .folded
        .splice(baseIdx - 1, 2);

      // Get new series index
      seriesIdx = tabs.tags.tags.indexOf(seriesName);

      // Insert
      tabs.tags.tags.splice(seriesIdx + 1, 0, 'baselineMode', 'baseline');
      tabs.tags.title.splice(seriesIdx + 1, 0, 'Baseline Mode', 'Baseline');
      tabs.tags.folded.splice(seriesIdx + 1, 0, ...folded);
    }

    // Reset active container
    tabs.tags.active = tabs.tags.tags.indexOf(active);

    this.setState({ tabs });
  }

  // Main event handlers
  handleChange(event) {
    const { param } = this.state;

    if (this.shift && param[event.target.name].multiOption) {
      handleShift(
        event.target.name,
        +event.target.id,
        this,
      );
    } else {
      this.selectOne(
        event.target.name,
        +event.target.id,
      );
    }

    // Set new tab
    this.setActiveContainer(event.target.name);
  }

  handleAll(event) {
    this.selectAll(event.target.name);

    // Set new tab
    this.setActiveContainer(event.target.name);
  }

  selectOne(name, id) {
    // Assign object to change reference and trigger plot render
    const { param } = this.state;
    const target = param[name];

    // Update options
    if (target.multiOption) {
      let active = target.active.slice();

      // Deselect all options unless CTRL is pressed
      if (!this.ctrl) {
        active = new Array(target.active.length).fill(false);

        // One option should always be selected
        active[id] = true;
      } else {
        active[id] = !active[id];

        // One option should always be selected
        if (active.every(x => !x)) active[id] = true;
      }


      // Update Anchors
      this.updateAnchors(name, id, id);

      // Link to new active
      param[name].active = active;
    } else {
      // Only one option. Update pointer
      target.active = id;
    }

    this.setMeta(name, id);

    this.setParam(name, param);
  }

  selectAll(name) {
    const { param } = this.state;
    this.selectRange(name, 0, param[name].active.length, true);
  }


  selectRange(name, from, to, boolean) {
    const { param } = this.state;
    const active = param[name].active.slice();

    // Change range
    for (let i = from; i < to; i += 1) {
      active[i] = boolean;
    }

    // Link to new active
    param[name].active = active;

    this.setParam(name, param);
  }


  // setParam should always be called to set a new param state
  setParam(name, param) {
    // Set all plot generator parameters and retrieve the object (PG has
    // internal checks to ensure setting compatibility)
    this.pg.setAllParameters(param);
    param = this.pg.getParameters();

    const figure = this.pg.getFigure();

    // Handle baseline position
    this.repositionBaseline(param.series.options[param.series.active]);

    this.setState({ param, figure });
  }

  // Render
  render() {
    const {
      loading,
      error,
      param,
      figure,
      saves,
      tabs,
      activeTab,
      saveNameValid,
      meta,
    } = this.state;
    
    if(loading){
      return (<div>loading</div>)
    }
    else{
      const ele = document.getElementById('ipl-progress-indicator');
      fade(ele); // react is loaded so we fade out the loading dom element
    }

    if(error){
      return (<div>{error}</div>)
    }

    return (
      <Container fluid className="p-0">
        <Row noGutters className="fixed-top">
          {/* NavBar and page title */}
          <NavBar mainApp={this} />
        </Row>
        <Row noGutters className="flex-grow-1 h-100">
          {/* App columns */}
          <Col
            className="bg-dark left-fixed"
            md={3}
          >
            {/* Left column */}
            <Tabs
              mainApp={this}
              activeTab={activeTab}
              tabs={tabs}
              param={param}
              saves={saves}
              saveNameValid={saveNameValid}
            />
          </Col>
          <Col
            className="right-fixed h-100 d-flex flex-column"
            md={9}
          >
            {/* Right column */}
            <Row noGutters>
              {/* Plot */}
              <PlotViewer
                figure={figure}
                handlePlotHover={this.handlePlotHover}
                handlePlotClick={this.handlePlotClick}
              />
            </Row>
            <Row noGutters className="flex-grow-1">
              {/* Meta viewer */}
              <MetaWindow
                meta={meta}
                link={this.link}
              />
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
