'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const PlanningAssessmentReportPage = () => {
  const router = useRouter();
  // Placeholder download handler
  const handleDownload = () => {
    // TODO: Replace with actual API call to download the file
    alert('Download will be implemented with the production API.');
  };

  const handleAskAI = () => {
    const message = "I'm looking at the Planning Assessment Report. Can you help me understand what this report includes and how I can use it?";
    router.push(`/chat?summary=${encodeURIComponent(message)}`);
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #eaeaea',
  };

  const questionStyle = {
    color: '#1a1a1a',
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  };

  const answerStyle = {
    color: '#4a4a4a',
    fontSize: '1rem',
    lineHeight: '1.6',
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', gap: '2rem', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Left Section: Q&A Cards */}
      <div style={{ flex: 2, background: '#f8f9fa', borderRadius: '16px', padding: '2rem' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          color: '#1a1a1a', 
          marginBottom: '2rem',
          borderBottom: '2px solid #0070f3',
          paddingBottom: '0.5rem'
        }}>
          About this Report
        </h2>
        
        <div style={cardStyle}>
          <h4 style={questionStyle}>1) What this report includes?</h4>
          <p style={answerStyle}>
            This comprehensive report includes detailed analysis of your planning assessment, 
            covering key metrics, performance indicators, and strategic recommendations. 
            It provides insights into current status and future opportunities.
          </p>
        </div>

        <div style={cardStyle}>
          <h4 style={questionStyle}>2) What this report can be used for?</h4>
          <p style={answerStyle}>
            This report serves as a valuable tool for strategic decision-making, 
            helping you identify areas for improvement, track progress, and align 
            your planning with organizational goals. It's ideal for both immediate 
            action items and long-term planning.
          </p>
        </div>

        <button
          onClick={handleAskAI}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            background: '#4c95bb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '1rem',
            transition: 'background-color 0.2s ease',
            fontWeight: '600',
          }}
        >
          Ask AI Assistant
        </button>
      </div>

      {/* Right Section: Button */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        background: '#ffffff', 
        borderRadius: '16px', 
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #eaeaea',
      }}>
        <button
          onClick={handleDownload}
          style={{
            width: '100%',
            padding: '1.25rem',
            fontSize: '1.1rem',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: 'auto',
            transition: 'background-color 0.2s ease',
            fontWeight: '600',
          }}
        >
          Pay and Go
        </button>
      </div>
    </div>
  );
};

export default PlanningAssessmentReportPage;
