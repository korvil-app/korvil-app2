import { AppProvider, useApp } from '@/context/AppContext';
import { Toasts } from '@/components/Toasts';
import { Home } from '@/screens/Home';
import { SettingsScreen } from '@/screens/Settings';
import { Setup } from '@/screens/setup/Setup';
import { GameShow } from '@/screens/game/GameShow';
import { Booth } from '@/screens/booth/Booth';
import { PackLibrary } from '@/screens/packs/PackLibrary';
import { PackEditor } from '@/screens/packs/PackEditor';

function Router() {
  const { route } = useApp();
  switch (route.name) {
    case 'home':
      return <Home />;
    case 'setup':
      return <Setup key={JSON.stringify(route)} initial={route} />;
    case 'game':
      return <GameShow packId={route.packId} teams={route.teams} rules={route.rules} />;
    case 'booth':
      return <Booth />;
    case 'packs':
      return <PackLibrary />;
    case 'editor':
      return <PackEditor key={route.packId} packId={route.packId} />;
    case 'settings':
      return <SettingsScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <Toasts />
    </AppProvider>
  );
}
