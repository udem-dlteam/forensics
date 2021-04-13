import React, { PureComponent } from 'react';
import Plot from 'react-plotly.js';

class PlotViewer extends PureComponent {
  render() {
    const { figure, handlePlotHover, handlePlotClick } = this.props;
    return (
      <React.Fragment>
        <Plot
          className="w-100"
          data={figure.data}
          layout={figure.layout}
          onHover={handlePlotHover}
          onClick={handlePlotClick}
        />
      </React.Fragment>
    );
  }
}

export default PlotViewer;
