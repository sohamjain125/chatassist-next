import React from 'react';

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  tip?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, description, buttonLabel, onButtonClick, tip }) => (
  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow mb-4">
    <div className="flex-shrink-0 text-primary">{icon}</div>
    <div className="flex-1 w-full">
      <div className="mb-2">
        <h3 className="text-lg font-semibold mb-1 w-full">{title} {tip && <span className="text-xs text-muted-foreground ml-2 align-middle">{tip}</span>}</h3>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:gap-4">
        <p className="text-gray-600 text-sm flex-1 mb-2 md:mb-0">{description}</p>
        {buttonLabel && onButtonClick && (
          <>
            <div className="hidden md:block w-px h-8 bg-gray-200 mx-4" />
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition whitespace-nowrap"
              onClick={onButtonClick}
            >
              {buttonLabel}
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

export default InfoCard;