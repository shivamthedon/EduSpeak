import React, { useState, useMemo, useEffect } from 'react';
import { Category, LearningItem } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { generateSpeech } from '../services/geminiService';
import Spinner from './Spinner';
import { BackIcon, PlayIcon } from './icons';

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
  isAudioReady: boolean
}> = ({ item, onSelect, isSpeaking, isSelected, isAudioReady }) => {
  
  const showSpinner = (isSelected && isSpeaking) || !isAudioReady;

  return (
    <button
      onClick={onSelect}
      disabled={isSpeaking || !isAudioReady}
      className={`relative rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center aspect-square shadow-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${
        isSelected ? 'border-8 border-white ring-4 ring-yellow-400' : 'border-4 border-white/50'
      }`}
      style={{ backgroundColor: isSelected && isSpeaking ? '#fde047' : '#ffffff' }}
      aria-label={`Learn about ${item.name}`}
    >
      <div className="w-full h-3/4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
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

const LearningActivity: React.FC<LearningActivityProps> = ({ category, onBack, onStartQuiz }) => {
  const [selectedItem, setSelectedItem] = useState<LearningItem | null>(null);
  const { play, isPlaying } = useAudioPlayer();
  const [ageFilter, setAgeFilter] = useState<AgeGroup>('all');
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});

  const filteredItems = useMemo(() => {
    if (!category.hasAgeFilter || ageFilter === 'all') {
      return category.items;
    }
    return category.items.filter(item => item.ageGroup === ageFilter);
  }, [category.items, category.hasAgeFilter, ageFilter]);
  
  useEffect(() => {
    let isMounted = true;
    const prefetchAudio = async () => {
      const itemsToPrefetch = filteredItems.filter(item => !audioCache[item.name]);
      for (const item of itemsToPrefetch) {
        if (!isMounted) break;
        try {
          const audio = await generateSpeech(item.name);
          if (isMounted) {
            setAudioCache(prev => ({ ...prev, [item.name]: audio }));
          }
        } catch (error) {
          console.error(`Failed to prefetch audio for ${item.name}:`, error);
        }
      }
    };
    prefetchAudio();
    return () => { isMounted = false; };
  }, [filteredItems, audioCache]);

  const handleItemSelect = async (item: LearningItem) => {
    if (isPlaying) return;
    setSelectedItem(item);
    try {
      let audio = audioCache[item.name];
      if (!audio) {
        audio = await generateSpeech(item.name);
        setAudioCache(prev => ({ ...prev, [item.name]: audio }));
      }
      // FIX: Pass audio as a base64 object to the updated play function.
      await play({ base64: audio });
    } catch (error) {
      console.error("Failed to handle item selection:", error);
    } finally {
        // We don't set selectedItem to null immediately to allow the highlight to persist during speech.
        // It will be cleared when the next item is selected or on component unmount.
    }
  };
  
  const getButtonClass = (group: AgeGroup) => {
    const baseClass = 'px-4 py-2 md:px-6 md:py-3 text-lg md:text-xl font-semibold rounded-full transition-colors shadow-md transform active:scale-95';
    if (ageFilter === group) {
        return `${baseClass} bg-white text-sky-600`;
    }
    return `${baseClass} bg-white/30 text-white hover:bg-white/50`;
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-6" style={{ background: 'linear-gradient(to bottom right, #60a5fa, #38bdf8, #a78bfa)' }}>
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
                    className="p-3 rounded-full bg-white/30 text-white hover:bg-white/50 transition-colors"
                    aria-label={`Play quiz about ${category.title}`}
                >
                    <PlayIcon className="w-8 h-8 text-white" />
                </button>
            </div>
            
            {category.hasAgeFilter && (
              <div className="flex justify-center space-x-2 md:space-x-4 mb-6">
                <button onClick={() => setAgeFilter('all')} className={getButtonClass('all')}>All</button>
                <button onClick={() => setAgeFilter('0-2')} className={getButtonClass('0-2')}>Ages 0-2</button>
                <button onClick={() => setAgeFilter('2-4')} className={getButtonClass('2-4')}>Ages 2-4</button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                {filteredItems.map((item) => (
                    <Flashcard
                        key={item.name}
                        item={item}
                        onSelect={() => handleItemSelect(item)}
                        isSpeaking={isPlaying && selectedItem?.name === item.name}
                        // FIX: Pass missing isSelected and isAudioReady props
                        isSelected={selectedItem?.name === item.name}
                        isAudioReady={!!audioCache[item.name]}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};

// FIX: Add default export to make the component importable
export default LearningActivity;
