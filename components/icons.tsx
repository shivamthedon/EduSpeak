
import React from 'react';

export const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM10.5 8.625c0-.621.504-1.125 1.125-1.125h.001c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-.001a1.125 1.125 0 01-1.125-1.125V8.625z" />
        <path d="M9.75 12.375a1.125 1.125 0 011.125-1.125h.001a1.125 1.125 0 011.125 1.125v5.25a1.125 1.125 0 01-1.125 1.125h-.001a1.125 1.125 0 01-1.125-1.125v-5.25z" transform="rotate(-90 12 12)"/>
    </svg>
);

export const ReplayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667-11.667l3.181 3.183A8.25 8.25 0 0118.015 12h-4.992m-4.993 0l-3.181-3.183a8.25 8.25 0 01-1.156-5.419" />
  </svg>
);

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16">
    <path d="M2.5.5A.5.5 0 0 1 3 .5h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5 1.5a.5.5 0 0 1 0-1zM3 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm9 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
  </svg>
);

// FIX: Add StoryIcon component which was missing and causing an error in StoryTime.tsx.
export const StoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388 1.175.885.653 1.5.955 1.5 1.123 0 .17-.615.42-1.5.955-1.293.743-2.553 1.144-3.388 1.175-1.33.134-2.458-.063-3.112-.752V2.687zM8 1.5v13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2.623c0-.21-.105-.41-.28-.543z"/>
    <path d="M7.5 2.687c-.654-.689-1.782-.886-3.112-.752-1.234.124-2.503.523-3.388 1.175C.115 3.25.5 3.552.5 3.723c0 .17.615.42 1.5.955 1.293.743 2.553 1.144 3.388 1.175 1.33.134 2.458-.063 3.112-.752V2.687zM8 1.5v13a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V2.623c0-.21.105-.41.28-.543z"/>
  </svg>
);
