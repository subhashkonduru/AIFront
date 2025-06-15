import React from 'react';
import './AnalysisDisplay.css'; // External CSS file for styling

const AnalysisDisplay = ({ analysis, optimizedCode, explanation, executionTime }) => (
  <div className="container">
    <div className="box">
      <h3>Analysis:</h3>
      <p>{analysis}</p>
    </div>
    <div className="box">
      <h3>Optimized Code:</h3>
      <pre>{optimizedCode}</pre>
    </div>
    <div className="box">
      <h3>Explanation:</h3>
      <p>{explanation}</p>
    </div>
    {executionTime > 0 && (
      <div className="box">
        <h3>Execution Time:</h3>
        <p>{executionTime} seconds</p>
      </div>
    )}
  </div>
);

export default AnalysisDisplay;