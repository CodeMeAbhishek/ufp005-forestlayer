import React from 'react';
import { ExternalLink } from 'lucide-react';

const SourceCitation = ({ sourceName, sourceUrl, className = '' }) => {
  if (!sourceName) return null;
  
  return (
    <div className={`text-xs opacity-80 italic mt-3 pt-3 border-t border-gray-200 flex items-center ${className}`}>
      <span className="text-gray-600">Source: </span>
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-forest-green transition-colors inline-flex items-center gap-1 text-forest-green ml-1"
        >
          {sourceName}
          <ExternalLink size={12} className="inline" />
        </a>
      ) : (
        <span className="text-gray-600 ml-1">{sourceName}</span>
      )}
    </div>
  );
};

export default SourceCitation;

