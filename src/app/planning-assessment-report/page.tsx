'use client';

import React from 'react';

const PlanningAssessmentReportPage = () => {
  // Placeholder download handler
  const handleDownload = () => {
    // TODO: Replace with actual API call to download the file
    alert('Download will be implemented with the production API.');
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', gap: '2rem', padding: '2rem' }}>
      {/* Left Section: Q&A */}
      <div style={{ flex: 2, background: '#f9f9f9', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h2>About this Report</h2>
        <div style={{ marginBottom: '2rem' }}>
          <h4>1) What this report includes?</h4>
          <p>Answer goes here. (Describe what the report contains.)</p>
        </div>
        <div>
          <h4>2) What this report can be used for?</h4>
          <p>Answer goes here. (Describe the use cases for the report.)</p>
        </div>
      </div>

      {/* Right Section: Button at the bottom */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', background: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button
          onClick={handleDownload}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: 'auto',
          }}
        >
          Pay and Go
        </button>
      </div>
    </div>
  );
};

export default PlanningAssessmentReportPage;
