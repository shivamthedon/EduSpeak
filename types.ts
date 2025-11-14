export interface LearningItem {
  name: string;
  emoji?: string;
  image?: string;
  ageGroup?: '0-2' | '2-4';
  sound?: string;
}

export interface Category {
  title: string;
  items: LearningItem[];
  color: string;
  emoji: string;
  hasAgeFilter?: boolean;
}

export enum AppView {
  MainMenu,
  Learning,
  Quiz,
}