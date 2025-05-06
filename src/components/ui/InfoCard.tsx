import React from 'react';

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, description }) => (
  <div className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow mb-4">
    <div className="flex-shrink-0 text-primary">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

export default InfoCard;