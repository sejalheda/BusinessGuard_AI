import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Footer } from './components/Footer';
import { McpToolsPanel } from './components/McpToolsPanel';
import { DemoWalkthrough } from './components/DemoWalkthrough';
import { useApp } from './context/AppContext';

// Pages
import { HomePage } from './pages/HomePage';
import { AlexaPage } from './pages/AlexaPage';
import { AdvisorPage } from './pages/AdvisorPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { AuditPage } from './pages/AuditPage';
import { ProtectionScorePage } from './pages/ProtectionScorePage';
import { CasesPage } from './pages/CasesPage';
import { McpToolsPage } from './pages/McpToolsPage';
import { PaymentCheckerPage } from './pages/PaymentCheckerPage';

export const AppContent: React.FC = () => {
  const { currentTab, setCurrentTab, activeCaseId, setActiveCaseId, isEmergencyActive } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mcpInspectorOpen, setMcpInspectorOpen] = useState(false);

  // Deep linking and direct route handler for /cases/:id and ?case=:id
  React.useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const queryCase = searchParams.get('case');

      if (pathname.startsWith('/cases/')) {
        const id = pathname.replace('/cases/', '').split('/')[0].trim();
        if (id) {
          setActiveCaseId(id.toUpperCase());
          setCurrentTab('cases');
          return;
        }
      } else if (queryCase) {
        setActiveCaseId(queryCase.toUpperCase());
        setCurrentTab('cases');
        return;
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [setActiveCaseId, setCurrentTab]);

  // Keep URL updated when activeCaseId changes
  React.useEffect(() => {
    if (activeCaseId && currentTab === 'cases') {
      const targetPath = `/cases/${activeCaseId}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    } else if (!activeCaseId && window.location.pathname.startsWith('/cases/')) {
      window.history.pushState(null, '', '/');
    }
  }, [activeCaseId, currentTab]);

  const renderActivePage = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage />;
      case 'alexa':
        return <AlexaPage />;
      case 'advisor':
        return <AdvisorPage />;
      case 'emergency':
        return <EmergencyPage />;
      case 'audit':
        return <AuditPage />;
      case 'score':
        return <ProtectionScorePage />;
      case 'cases':
        return <CasesPage />;
      case 'payment':
        return <PaymentCheckerPage />;
      case 'mcp':
        return <McpToolsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors ${
        isEmergencyActive ? 'border-t-4 border-red-600' : ''
      }`}
    >
      <div className="flex flex-1">
        {/* Left Navigation Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            onOpenMcpPanel={() => setMcpInspectorOpen(true)}
            onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {renderActivePage()}
          </main>

          <Footer />
        </div>
      </div>

      {/* Global MCP Tools Side Panel */}
      <McpToolsPanel
        isOpen={mcpInspectorOpen}
        onClose={() => setMcpInspectorOpen(false)}
        toolCalls={[]}
      />

      {/* Interactive Guided Demo Tour */}
      <DemoWalkthrough />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
