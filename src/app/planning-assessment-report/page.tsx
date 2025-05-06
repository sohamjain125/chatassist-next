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
    <div className="flex min-h-[80vh] gap-8 p-8 max-w-7xl mx-auto">
      {/* Left Section: Q&A Cards */}
      <div className="flex-2 bg-gray-50 rounded-2xl p-8">
        <h2 className="text-4xl text-gray-900 mb-8 border-b-2 border-blue-600 pb-2">
          About this Report
        </h2>
        
        <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-100">
          <h4 className="text-xl text-gray-900 font-semibold mb-3">1) What this report includes?</h4>
          <p className="text-gray-600 text-base leading-relaxed">
            This comprehensive report includes detailed analysis of your planning assessment, 
            covering key metrics, performance indicators, and strategic recommendations. 
            It provides insights into current status and future opportunities.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-100">
          <h4 className="text-xl text-gray-900 font-semibold mb-3">2) What this report can be used for?</h4>
          <p className="text-gray-600 text-base leading-relaxed">
            This report serves as a valuable tool for strategic decision-making, 
            helping you identify areas for improvement, track progress, and align 
            your planning with organizational goals. It's ideal for both immediate 
            action items and long-term planning.
          </p>
        </div>

        <button
          onClick={handleAskAI}
          className="w-full py-4 text-lg bg-[#4c95bb] text-white border-none rounded-lg cursor-pointer mt-4 transition-colors duration-200 font-semibold hover:bg-[#3d7a9b]"
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
