import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Home, Clock, LayoutDashboard, Lightbulb, Share2, Settings } from 'lucide-react';
import { StoreProvider } from './store';
import { HomeScreen } from './screens/Home';
import { TimelineScreen } from './screens/Timeline';
import { AnalyticsScreen } from './screens/Analytics';
import { InsightsScreen } from './screens/Insights';
import { ReportScreen } from './screens/Report';
import { SettingsScreen } from './screens/Settings';

const BottomNav = () => {
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/timeline', icon: Clock, label: 'Timeline' },
    { path: '/analytics', icon: LayoutDashboard, label: 'Analytics' },
    { path: '/report', icon: Share2, label: 'Report' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-app-surface/80 backdrop-blur-2xl border border-app-border rounded-full px-2 py-2 flex justify-between items-center w-full max-w-[340px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all duration-300 ease-out ${
                isActive 
                  ? 'text-white' 
                  : 'text-white/40 hover:text-white/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 rounded-full animate-scale-in" />
                )}
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <div className="h-screen w-screen bg-app-bg text-white font-sans overflow-hidden flex justify-center selection:bg-blue-500/30">
          {/* Mobile container constraint for web view */}
          <div className="w-full max-w-md h-full relative bg-app-bg border-x border-app-border shadow-2xl overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/timeline" element={<TimelineScreen />} />
              <Route path="/analytics" element={<AnalyticsScreen />} />
              <Route path="/insights" element={<InsightsScreen />} />
              <Route path="/report" element={<ReportScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Routes>
            <BottomNav />
          </div>
        </div>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
