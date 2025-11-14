import React, { useState, useMemo, useEffect } from 'react';
import { Category, LearningItem } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { BackIcon, ReplayIcon, TrophyIcon } from './icons';
import { generateSpeech } from '../services/geminiService';

interface QuizActivityProps {
  category: Category;
  items: LearningItem[];
  onBack: () => void;
}

interface QuizQuestion {
  correctItem: LearningItem;
  options: LearningItem[];
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const generateQuestions = (items: LearningItem[], count: number = 5, optionsCount: number = 3): QuizQuestion[] => {
  if (items.length < optionsCount) {
    optionsCount = items.length;
  }
  const shuffledItems = shuffleArray(items);
  const questions: QuizQuestion[] = [];
  
  for (let i = 0; i < Math.min(count, shuffledItems.length); i++) {
    const correctItem = shuffledItems[i];
    const otherItems = items.filter(item => item.name !== correctItem.name);
    const distractors = shuffleArray(otherItems).slice(0, optionsCount - 1);
    const options = shuffleArray([correctItem, ...distractors]);
    questions.push({ correctItem, options });
  }

  return questions;
};

const ItemVisual: React.FC<{ item: LearningItem, imageClassName?: string, emojiClassName?: string }> = ({ item, imageClassName = "max-h-full max-w-full object-contain", emojiClassName = "text-6xl md:text-8xl" }) => {
    if (item.image) {
        return <img src={item.image} alt={item.name} className={imageClassName} />;
    }
    return <span className={emojiClassName}>{item.emoji}</span>;
}

const QuizActivity: React.FC<QuizActivityProps> = ({ category, items, onBack }) => {
  const questions = useMemo(() => generateQuestions(items), [items]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [disabledAnswers, setDisabledAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const [isAsking, setIsAsking] = useState(false);

  const { play, isPlaying } = useAudioPlayer();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    let isMounted = true;
    const prefetchFeedbackAudio = async () => {
        try {
            if (!audioCache['Correct!'] && !audioCache['Try again.']) {
                const [correctAudio, incorrectAudio] = await Promise.all([
                    generateSpeech("Correct!"),
                    generateSpeech("Try again.")
                ]);
                if (isMounted) {
                    setAudioCache(prev => ({
                        ...prev,
                        "Correct!": correctAudio,
                        "Try again.": incorrectAudio
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to prefetch feedback audio", error);
        }
    };
    prefetchFeedbackAudio();
    return () => { isMounted = false; };
  }, [audioCache]);

  useEffect(() => {
    if (isFinished || !currentQuestion) return;
    let isMounted = true;

    const askQuestion = async () => {
      setIsAsking(true);
      const questionText = `Which one is ${currentQuestion.correctItem.name}?`;
      try {
        let audio = audioCache[questionText];
        if (!audio) {
            audio = await generateSpeech(questionText);
            if (isMounted) {
              setAudioCache(prev => ({ ...prev, [questionText]: audio }));
            }
        }
        if (isMounted) await play({ base64: audio });
      } catch (e) {
        console.error("Failed to play question audio", e);
        if (isMounted) play(questionText);
      } finally {
        if (isMounted) setIsAsking(false);
      }
    };
    
    const timer = setTimeout(askQuestion, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
    
  }, [currentQuestion, isFinished]);

  const playFeedback = async (text: 'Correct!' | 'Try again.') => {
      try {
          const audio = audioCache[text];
          if (audio) {
              await play({ base64: audio });
          } else {
              const newAudio = await generateSpeech(text);
              setAudioCache(prev => ({ ...prev, [text]: newAudio }));
              await play({ base64: newAudio });
          }
      } catch (e) {
          console.error(`Failed to play feedback audio for "${text}"`, e);
          play(text);
      }
  };

  const handleAnswerClick = async (selectedItem: LearningItem) => {
    if (feedback === 'correct' || isPlaying || isAsking) return;
    setSelectedAnswer(selectedItem.name);

    if (selectedItem.name === currentQuestion.correctItem.name) {
      setFeedback('correct');
      setScore(s => s + 1);
      await playFeedback("Correct!");
      
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setDisabledAnswers([]);
          setFeedback(null);
          setSelectedAnswer(null);
        } else {
          setIsFinished(true);
        }
      }, 1500);

    } else {
      setFeedback('incorrect');
      setDisabledAnswers(prev => [...prev, selectedItem.name]);
      await playFeedback("Try again.");
      
      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
      }, 1000);
    }
  };

  const handleRestart = () => {
      setCurrentQuestionIndex(0);
      setDisabledAnswers([]);
      setFeedback(null);
      setSelectedAnswer(null);
      setIsFinished(false);
      setScore(0);
  }

  if (isFinished) {
    return (
        <div className="w-full min-h-screen p-4 md:p-6 flex flex-col items-center justify-center text-white text-center bg-anim" style={{ background: 'radial-gradient(circle, #86efac, #4ade80, #22c55e)' }}>
            <TrophyIcon className="w-32 h-32 text-yellow-300 mb-4" />
            <h1 className="text-6xl font-bold mb-4 text-shadow-fun">Great Job!</h1>
            <p className="text-3xl mb-8">You scored {score} out of {questions.length}!</p>
            <div className="flex space-x-4">
                 <button 
                    onClick={handleRestart}
                    className="flex items-center text-xl font-bold bg-white text-green-600 rounded-full px-8 py-4 shadow-lg transform transition-transform hover:scale-105 active:scale-95"
                 >
                    <ReplayIcon className="w-7 h-7 mr-3" />
                    Play Again
                 </button>
                 <button 
                    onClick={onBack}
                    className="flex items-center text-xl font-bold bg-white/30 text-white rounded-full px-8 py-4 shadow-lg transform transition-transform hover:scale-105 active:scale-95"
                 >
                    <BackIcon className="w-7 h-7 mr-3" />
                    Back
                 </button>
            </div>
        </div>
    );
  }
  
  if (!currentQuestion) {
      return (
          <div className="w-full min-h-screen flex items-center justify-center">
              <p>Loading quiz...</p>
          </div>
      )
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-6 flex flex-col bg-anim" style={{ background: 'linear-gradient(to bottom, #f3e8ff, #e9d5ff)' }}>
        <div className="flex items-center mb-6">
            <button
                onClick={onBack}
                className="p-3 rounded-full bg-purple-200 text-purple-700 hover:bg-purple-300 transition-colors"
                aria-label="Go back to learning"
            >
                <BackIcon className="w-8 h-8" />
            </button>
            <div className="flex-grow text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-purple-800">
                    Quiz: {category.title}
                </h1>
                <p className="text-purple-600 text-lg">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            <div className="w-14 h-14"></div> {/* Spacer */}
        </div>
        
        <div className="flex-grow flex flex-col items-center justify-center">
            <div className="mb-8 text-center">
                <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Which one is...</p>
                <div className="px-6 py-3 bg-white rounded-full shadow-md">
                    <p className="text-4xl md:text-5xl font-bold text-purple-700">{currentQuestion.correctItem.name}</p>
                </div>
            </div>

            <div className="w-full max-w-2xl grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {currentQuestion.options.map((item) => {
                    const isSelected = selectedAnswer === item.name;
                    const isCorrect = isSelected && feedback === 'correct';
                    const isIncorrect = isSelected && feedback === 'incorrect';
                    const isDisabled = disabledAnswers.includes(item.name) || feedback === 'correct';

                    let animationClass = '';
                    if (isCorrect) animationClass = 'animate-pop';
                    if (isIncorrect) animationClass = 'animate-shake';
                    
                    let ringColor = 'ring-purple-500';
                    if (isCorrect) ringColor = 'ring-green-500';
                    if (isIncorrect) ringColor = 'ring-red-500';

                    return (
                        <button
                            key={item.name}
                            onClick={() => handleAnswerClick(item)}
                            disabled={isDisabled || isPlaying || isAsking}
                            className={`relative p-4 aspect-square flex items-center justify-center bg-white rounded-3xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${animationClass}`}
                        >
                            <div className={`absolute inset-0 rounded-3xl ring-8 transition-all duration-200 ${isSelected ? ringColor : 'ring-transparent'}`}></div>
                             <ItemVisual item={item} />
                        </button>
                    )
                })}
            </div>
        </div>
    </div>
  );
};

export default QuizActivity;