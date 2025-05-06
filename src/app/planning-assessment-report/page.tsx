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
    <div className="flex flex-col lg:flex-row min-h-[80vh] gap-8 p-8 max-w-7xl mx-auto">
      {/* Left Section: Q&A Cards */}
      <div className="lg:flex-[2] bg-gray-50 rounded-2xl p-8 mb-8 lg:mb-0">
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
      <div className="lg:flex-1 flex flex-col justify-end items-center bg-white rounded-2xl p-8 shadow-md border border-gray-100">
        <button
          onClick={handleDownload}
          className="w-full py-5 text-lg bg-blue-600 text-white rounded-lg font-semibold mt-auto transition-colors duration-200 hover:bg-blue-700"
        >
          Pay and Go
        </button>
      </div>
    </div>
  );
};

export default PlanningAssessmentReportPage;
