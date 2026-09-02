import { useEffect, useState } from 'react';
import Footer from './components/Footer.jsx';
import HiloAssistant from './components/HiloAssistant.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import AgendaScreen from './screens/AgendaScreen.jsx';
import ExploreScreen from './screens/ExploreScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import MapScreen from './screens/MapScreen.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import NotFoundScreen from './screens/NotFoundScreen.jsx';
import OpportunitiesScreen from './screens/OpportunitiesScreen.jsx';
import SavedScreen from './screens/SavedScreen.jsx';
import TalentScreen from './screens/TalentScreen.jsx';

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('No fue posible cargar los contenidos');
  return response.json();
}

function getScreen() {
  return window.location.hash.replace('#', '') || 'inicio';
}

export default function App() {
  const [screen, setScreen] = useState(getScreen);
  const [publications, setPublications] = useState([]);
  const [activeKind, setActiveKind] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      setScreen(getScreen());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    getJson('/api/publications')
      .then(setPublications)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const events = publications.filter((publication) => publication.kind === 'EVENTO');
  const opportunities = publications.filter((publication) => publication.kind === 'OPORTUNIDAD');
  const talents = publications.filter((publication) => publication.kind === 'TALENTO');

  const content = {
    inicio: <HomeScreen onExplore={() => { window.location.hash = 'explorar'; }} />,
    explorar: <ExploreScreen publications={publications} activeKind={activeKind} onKindChange={setActiveKind} search={search} onSearchChange={setSearch} loading={loading} error={error} />,
    mapa: <MapScreen />,
    agenda: <AgendaScreen events={events} />,
    oportunidades: <OpportunitiesScreen opportunities={opportunities} />,
    talento: <TalentScreen talents={talents} />,
    guardadas: <SavedScreen />,
    login: <LoginScreen onSuccess={() => { window.location.hash = 'inicio'; }} />,
  }[screen] || <NotFoundScreen />;

  return <><SiteHeader onLogin={() => { window.location.hash = 'login'; }} /><main>{content}</main><Footer /><HiloAssistant publications={publications} /></>;
}
