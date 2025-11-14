import React, { useState } from 'react';
import { AppView, Category, LearningItem } from './types';
import { LEARNING_CATEGORIES } from './constants';
import LearningActivity from './components/LearningActivity';
import QuizActivity from './components/QuizActivity';

interface CategoryCardProps {
  title: string;
  color: string;
  onClick: () => void;
  emoji?: string;
  icon?: React.ReactNode;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, color, onClick, emoji, icon }) => (
  <button
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] shadow-xl text-white font-bold text-3xl md:text-4xl flex flex-col items-center justify-center aspect-square transform transition-transform duration-300 hover:scale-105 hover:rotate-[-2deg] active:scale-95 border-4 border-white/80 ${color}`}
  >
    <div className="text-6xl md:text-7xl mb-4">{icon || emoji}</div>
    <span>{title}</span>
  </button>
);

const MainMenu: React.FC<{ 
    onSelectCategory: (category: Category) => void; 
}> = ({ onSelectCategory }) => (
  <div className="p-4 md:p-8 min-h-screen w-full flex flex-col items-center bg-anim" style={{ background: 'radial-gradient(circle, #a5f3fc, #67e8f9, #22d3ee)' }}>
    <header className="text-center my-8 md:my-12">
      <h1 className="text-5xl md:text-7xl font-bold text-white text-shadow-fun">
        EduSpeak
      </h1>
      <p className="text-xl md:text-2xl text-white/90 mt-2">Let's learn and have fun!</p>
    </header>
    <main className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {LEARNING_CATEGORIES.map((cat) => (
          <CategoryCard key={cat.title} title={cat.title} emoji={cat.emoji} color={cat.color} onClick={() => onSelectCategory(cat)} />
        ))}
      </div>
    </main>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.MainMenu);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [quizItems, setQuizItems] = useState<LearningItem[]>([]);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView(AppView.Learning);
  };
  
  const handleStartQuiz = (items: LearningItem[], category: Category) => {
    setSelectedCategory(category);
    setQuizItems(items);
    setCurrentView(AppView.Quiz);
  };

  const backToLearning = () => {
    if (selectedCategory) {
      setCurrentView(AppView.Learning);
    } else {
      backToMenu();
    }
  };

  const backToMenu = () => {
    setCurrentView(AppView.MainMenu);
    setSelectedCategory(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.Learning:
        return selectedCategory ? <LearningActivity category={selectedCategory} onBack={backToMenu} onStartQuiz={handleStartQuiz} /> : null;
      case AppView.Quiz:
        return selectedCategory ? <QuizActivity category={selectedCategory} items={quizItems} onBack={backToLearning} /> : null;
      case AppView.MainMenu:
      default:
        return <MainMenu onSelectCategory={handleSelectCategory} />;
    }
  };

  return <div className="antialiased text-slate-700">{renderContent()}</div>;
};

export default App;