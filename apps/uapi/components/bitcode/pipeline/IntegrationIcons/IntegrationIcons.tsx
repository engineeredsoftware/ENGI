import React from 'react';

export const NotionIcon = ({ small }: { small?: boolean }) => (
  <svg className={`${small ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#67feb7]`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 4a2 2 0 012-2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 7h6M9 11h6M9 15h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FigmaIcon = ({ small }: { small?: boolean }) => (
  <svg className={`${small ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#67feb7]`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 2H8.5a3.5 3.5 0 000 7h3.5V2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 9H8.5a3.5 3.5 0 000 7h3.5V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 16H8.5a3.5 3.5 0 103.5 3.5V16z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.5 9a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
