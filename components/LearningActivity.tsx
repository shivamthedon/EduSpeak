

import React, { useState, useMemo } from 'react';
import { Category, LearningItem } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { generateSpeech } from '../services/geminiService';
import Spinner from './Spinner';
import { BackIcon, TrophyIcon, SpeakerIcon } from './icons';

interface LearningActivityProps {
  category: Category;
  onBack: () => void;
  onStartQuiz: (items: LearningItem[], category: Category) => void;
}

type AgeGroup = 'all' | '0-2' | '2-4';

const Flashcard: React.FC<{ 
  item: LearningItem, 
  onSelect: () => void, 
  isSpeaking: boolean, 
  isSelected: boolean,
  isLoading: boolean
}> = ({ item, onSelect, isSpeaking, isSelected, isLoading }) => {
  
  const showSpinner = (isSelected && isSpeaking) || isLoading;

  return (
    <button
      onClick={onSelect}
      disabled={isSpeaking || isLoading}
      className={`relative rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center aspect-square shadow-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${
        isSelected ? 'border-8 border-white ring-4 ring-yellow-400' : 'border-4 border-white/50'
      }`}
      style={{ backgroundColor: isSelected && isSpeaking ? '#fde047' : '#ffffff' }}
      aria-label={`Learn about ${item.name}`}
    >
      <div className={`w-full h-3/4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isSelected && isSpeaking ? 'animate-jiggle' : ''}`}>
        {item.image ? (
            <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
        ) : (
            <span className="text-6xl md:text-8xl lg:text-9xl">{item.emoji}</span>
        )}
      </div>
      <p className="mt-4 text-xl md:text-2xl font-bold text-gray-700">{item.name}</p>
      {showSpinner && (
        <div className="absolute inset-0 bg-black/30 rounded-3xl flex items-center justify-center">
          <Spinner size="h-12 w-12" />
        </div>
      )}
    </button>
  );
};

const generateAudioForItem = async (item: LearningItem, categoryTitle: string) => {
  let textToSpeak: string;

  if ((categoryTitle === 'Animals' || categoryTitle === 'Vehicles') && item.sound) {
    textToSpeak = `${item.name}. ${item.sound}.`;
  } else if (categoryTitle === 'Fruits') {
    textToSpeak = `Mmm, a yummy ${item.name}!`;
  } else if (categoryTitle === 'Vegetables') {
    textToSpeak = `Yummy, yummy, a healthy ${item.name}!`;
  } else if (categoryTitle === 'Alphabets') {
    textToSpeak = `This is the letter ${item.name}.`;
  } else if (categoryTitle === 'Numbers') {
    textToSpeak = `The number ${item.name}.`;
  } else if (categoryTitle === 'Colors') {
    textToSpeak = `The color ${item.name}! So pretty!`;
  } else if (categoryTitle === 'Shapes') {
    textToSpeak = `Look, a ${item.name}!`;
  } else if (categoryTitle === 'Body Parts') {
    textToSpeak = `This is your ${item.name}.`;
  } else {
    textToSpeak = item.name;
  }
  
  return generateSpeech(textToSpeak);
};

const LearningActivity: React.FC<LearningActivityProps> = ({ category, onBack, onStartQuiz }) => {
  const [selectedItem, setSelectedItem] = useState<LearningItem | null>(null);
  const { play, isPlaying, cleanup } = useAudioPlayer();
  const [ageFilter, setAgeFilter] = useState<AgeGroup>('all');
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const [loadingItemName, setLoadingItemName] = useState<string | null>(null);


  const filteredItems = useMemo(() => {
    if (!category.hasAgeFilter || ageFilter === 'all') {
      return category.items;
    }
    return category.items.filter(item => item.ageGroup === ageFilter);
  }, [category.items, category.hasAgeFilter, ageFilter]);
  
  const handleItemSelect = async (item: LearningItem) => {
    if (isPlaying || selectedItem || loadingItemName) return;

    setSelectedItem(item);

    try {
        let audio = audioCache[item.name];
        if (!audio) {
            setLoadingItemName(item.name);
            const generatedAudio = await generateAudioForItem(item, category.title);
            setAudioCache(prev => ({ ...prev, [item.name]: generatedAudio }));
            setLoadingItemName(null);
            audio = generatedAudio;
        }
        await play({ base64: audio });
    } catch (error) {
        console.error("Failed to handle item selection:", error);
        setSelectedItem(null);
        setLoadingItemName(null);
    }
  };

  const handleCloseModal = () => {
    cleanup();
    setSelectedItem(null);
  };
  
  const getButtonClass = (group: AgeGroup) => {
    const baseClass = 'px-4 py-2 md:px-6 md:py-3 text-lg md:text-xl font-semibold rounded-full transition-colors shadow-md transform active:scale-95';
    if (ageFilter === group) {
        return `${baseClass} bg-white text-sky-600`;
    }
    return `${baseClass} bg-white/30 text-white hover:bg-white/50`;
  };

  const isModalOpen = !!selectedItem;

  return (
    <div className="w-full min-h-screen p-4 md:p-6 bg-anim" style={{ background: 'linear-gradient(to bottom right, #60a5fa, #38bdf8, #a78bfa)' }}>
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="p-3 rounded-full bg-white/30 text-white hover:bg-white/50 transition-colors"
                    aria-label="Go back to main menu"
                >
                    <BackIcon className="w-8 h-8" />
                </button>
                <h1 className="text-4xl md:text-5xl font-bold text-white text-center flex-grow flex items-center justify-center">
                    <span className="text-5xl md:text-6xl mr-4">{category.emoji}</span>
                    {category.title}
                </h1>
                <button
                    onClick={() => onStartQuiz(filteredItems, category)}
                    className="p-3 rounded-2xl bg-white/30 text-white hover:bg-white/50 transition-colors transform hover:rotate-6 active:scale-90"
                    aria-label={`Play quiz about ${category.title}`}
                >
                    <TrophyIcon className="w-8 h-8 text-white" />
                </button>
            </div>
            
            {category.hasAgeFilter && (
              <div className="flex justify-center space-x-2 md:space-x-4 mb-6">
                <button onClick={() => setAgeFilter('all')} className={getButtonClass('all')}>All</button>
                <button onClick={() => setAgeFilter('0-2')} className={getButtonClass('0-2')}>Ages 0-2</button>
                <button onClick={() => setAgeFilter('2-4')} className={getButtonClass('2-4')}>Ages 2-4</button>
              </div>
            )}

            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 transition-all duration-300 ${isModalOpen ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
                {filteredItems.map((item) => (
                    <Flashcard
                        key={item.name}
                        item={item}
                        onSelect={() => handleItemSelect(item)}
                        isSpeaking={isPlaying && selectedItem?.name === item.name}
                        isSelected={selectedItem?.name === item.name}
                        isLoading={loadingItemName === item.name}
                    />
                ))}
            </div>
        </div>
        {isModalOpen && selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleCloseModal}>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={handleCloseModal} 
                        className="absolute -top-4 -right-4 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 shadow-lg transform transition-transform hover:scale-110"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center aspect-square shadow-2xl bg-white w-64 h-64 md:w-80 md:h-80 animate-pop">
                        <div className={`w-full h-3/4 flex items-center justify-center ${isPlaying ? 'animate-jiggle' : ''}`}>
                            {selectedItem.image ? (
                                <img src={selectedItem.image} alt={selectedItem.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                                <span className="text-8xl md:text-9xl">{selectedItem.emoji}</span>
                            )}
                        </div>
                        <p className="mt-4 text-3xl md:text-4xl font-bold text-gray-700">{selectedItem.name}</p>
                        {isPlaying && (
                            <div className="absolute -bottom-5 p-3 bg-yellow-400 rounded-full shadow-lg">
                                <SpeakerIcon className="w-8 h-8 text-white"/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default LearningActivity;
