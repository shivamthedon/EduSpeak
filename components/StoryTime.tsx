

import React, { useState } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { generateSpeech } from '../services/geminiService';
import Spinner from './Spinner';
import { BackIcon, SpeakerIcon, StoryIcon } from './icons';
import { GoogleGenAI } from '@google/genai';

interface StoryTimeProps {
  onBack: () => void;
}

const StoryTime: React.FC<StoryTimeProps> = ({ onBack }) => {
  const [story, setStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { play, isPlaying } = useAudioPlayer();
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  const handleNewStory = async () => {
    if (isLoading || isPlaying) return;
    setIsLoading(true);
    setStory(null);
    setCurrentAudio(null);
    try {
      // FIX: Use Gemini API to generate a story.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Tell me a short, happy story for a toddler. It should be simple and cheerful, about 2-3 short paragraphs.',
        config: {
            systemInstruction: 'You are a storyteller for kids under 5 years old.'
        }
      });
      const newStory = response.text;
      if (!newStory) {
          throw new Error("No story generated.");
      }
      setStory(newStory);
      const audio = await generateSpeech(newStory);
      setCurrentAudio(audio);
      // FIX: Pass audio as a base64 object to the updated play function.
      await play({ base64: audio });
    } catch (error) {
      console.error("Failed to generate story and speech:", error);
      setStory("Oops! I couldn't think of a story right now. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplay = async () => {
    if (isPlaying || !currentAudio) return;
    // FIX: Pass audio as a base64 object to the updated play function.
    await play({ base64: currentAudio });
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-6 flex flex-col items-center justify-center bg-anim" style={{ background: 'linear-gradient(to bottom right, #f87171, #fb923c, #facc15)' }}>
      <button
        onClick={onBack}
        className="absolute top-6 left-6 p-3 rounded-full bg-white/30 text-white hover:bg-white/50 transition-colors"
      >
        <BackIcon className="w-8 h-8" />
      </button>

      <div className="text-center text-white mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-shadow-fun">Story Time!</h1>
        <p className="text-xl md:text-2xl mt-2">Let's listen to a happy story.</p>
      </div>

      <div className="w-full max-w-3xl bg-stone-100 rounded-3xl shadow-2xl p-2 sm:p-4 text-center min-h-[24rem] flex justify-center items-center">
        <div className="w-full h-full flex flex-row bg-white rounded-2xl shadow-inner">
            {/* Left page */}
            <div className="w-1/2 p-6 md:p-8 flex items-center justify-center border-r-2 border-r-stone-200">
                <StoryIcon className="w-24 h-24 text-orange-400" />
            </div>
            {/* Right page */}
            <div className="w-1/2 p-6 md:p-8 flex items-center justify-center">
                 {isLoading ? (
                    <Spinner size="h-16 w-16" />
                ) : story ? (
                    <div>
                        <p className="text-xl md:text-2xl text-gray-700 leading-relaxed text-left">{story}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <p className="text-lg text-gray-500">Press the button for a new story!</p>
                    </div>
                )}
            </div>
        </div>
    </div>

      <div className="flex space-x-4 mt-8">
        <button
          onClick={handleNewStory}
          disabled={isLoading || isPlaying}
          className="flex items-center justify-center text-xl md:text-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400/50 rounded-full px-8 py-5 shadow-lg transform transition-transform hover:scale-105 active:scale-95"
        >
          <StoryIcon className="w-7 h-7 mr-3" />
          {isLoading ? 'Thinking...' : 'New Story'}
        </button>
        {story && currentAudio && (
           <button
             onClick={handleReplay}
             disabled={isLoading || isPlaying}
             className="flex items-center justify-center text-xl md:text-2xl font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400/50 rounded-full px-8 py-5 shadow-lg transform transition-transform hover:scale-105 active:scale-95"
           >
              <SpeakerIcon className="w-7 h-7 mr-3" />
              Listen Again
           </button>
        )}
      </div>
    </div>
  );
};

export default StoryTime;
