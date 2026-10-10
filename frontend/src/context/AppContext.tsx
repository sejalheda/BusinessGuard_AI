import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
  isEmergencyActive: boolean;
  setEmergencyActive: (active: boolean) => void;
  isDemoActive: boolean;
  startDemo: () => void;
  stopDemo: () => void;
  demoStep: number;
  setDemoStep: (step: number) => void;
  usingDemoBadge: boolean;
  setUsingDemoBadge: (val: boolean) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isEmergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [usingDemoBadge, setUsingDemoBadge] = useState<boolean>(true); // Default shows mock/demo responses badge
  const [currentTab, setCurrentTab] = useState<string>('home');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const startDemo = () => {
    setIsDemoActive(true);
    setDemoStep(1);
    setCurrentTab('alexa');
  };

  const stopDemo = () => {
    setIsDemoActive(false);
    setDemoStep(0);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeCaseId,
        setActiveCaseId,
        isEmergencyActive,
        setEmergencyActive,
        isDemoActive,
        startDemo,
        stopDemo,
        demoStep,
        setDemoStep,
        usingDemoBadge,
        setUsingDemoBadge,
        currentTab,
        setCurrentTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
