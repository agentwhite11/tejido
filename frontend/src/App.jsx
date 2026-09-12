import { useEffect, useState } from 'react';
import Footer from './components/Footer.jsx';
import HiloAssistant from './components/HiloAssistant.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import AgendaScreen from './screens/AgendaScreen.jsx';
import ArtistScreen from './screens/ArtistScreen.jsx';
import ArtistDashboard from './screens/ArtistDashboard.jsx';
import ArtistMediaKit from './screens/ArtistMediaKit.jsx';
import CollaboratorScreen from './screens/CollaboratorScreen.jsx';
import ExploreScreen from './screens/ExploreScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import MapScreen from './screens/MapScreen.jsx';
import MoneystackScreen from './screens/MoneystackScreen.jsx';
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

function getRoute() {
  const path = window.location.pathname;
  const hash = window.location.hash.replace('#', '') || '';

  if (path.startsWith('/artistas/')) {
    const slug = path.split('/artistas/')[1]?.split('/')[0];
    const rest = path.split('/artistas/')[1] || '';
    if (rest.includes('/media-kit')) return { screen: 'media-kit', slug };
    if (rest.includes('/dashboard')) return { screen: 'dashboard', slug };
    return { screen: 'artist', slug };
  }

  if (hash.startsWith('artista/')) {
    const slug = hash.split('/')[1] || 'og-mauro';
    if (hash.includes('/media-kit')) return { screen: 'media-kit', slug };
    if (hash.includes('/dashboard')) return { screen: 'dashboard', slug };
    return { screen: 'artist', slug };
  }

  return { screen: hash || 'inicio', slug: null };
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [publications, setPublications] = useState([]);
  const [activeKind, setActiveKind] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleChange = () => {
      setRoute(getRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleChange);
    window.addEventListener('popstate', handleChange);

    const token = localStorage.getItem('tejido_token');
    if (token) {
      fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    }

    getJson('/api/publications')
      .then(setPublications)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
    return () => {
      window.removeEventListener('hashchange', handleChange);
      window.removeEventListener('popstate', handleChange);
    };
  }, []);

  function handleLogin(userData) {
    setUser(userData);
    const returnTo = sessionStorage.getItem('tejido_return_to');
    if (returnTo) {
      sessionStorage.removeItem('tejido_return_to');
      window.location.hash = returnTo;
    }
  }

  function handleLogout() {
    localStorage.removeItem('tejido_token');
    setUser(null);
    window.location.hash = 'inicio';
  }

  const isArtistRoute = route.screen === 'artist' || route.screen === 'media-kit' || route.screen === 'dashboard';

  const events = publications.filter((publication) => publication.kind === 'EVENTO');
  const opportunities = publications.filter((publication) => publication.kind === 'OPORTUNIDAD');
  const talents = publications.filter((publication) => publication.kind === 'TALENTO');

  let content;
  switch (route.screen) {
    case 'artist':
      content = <ArtistScreen />;
      break;
    case 'media-kit':
      content = <ArtistMediaKit />;
      break;
    case 'dashboard':
      content = user ? <ArtistDashboard /> : <LoginScreen onSuccess={handleLogin} />;
      break;
    case 'explorar':
      content = <ExploreScreen publications={publications} activeKind={activeKind} onKindChange={setActiveKind} search={search} onSearchChange={setSearch} loading={loading} error={error} user={user} />;
      break;
    case 'mapa':
      content = <MapScreen publications={publications} />;
      break;
    case 'agenda':
      content = <AgendaScreen events={events} />;
      break;
    case 'oportunidades':
      content = <OpportunitiesScreen opportunities={opportunities} />;
      break;
    case 'talento':
      content = <TalentScreen talents={talents} />;
      break;
    case 'guardadas':
      content = <SavedScreen />;
      break;
    case 'colaborador':
      content = <CollaboratorScreen user={user} />;
      break;
    case 'moneystack':
      content = <MoneystackScreen />;
      break;
    case 'login':
      content = <LoginScreen onSuccess={handleLogin} />;
      break;
    case 'inicio':
    default:
      content = <HomeScreen onExplore={() => { window.location.hash = 'explorar'; }} publications={publications} />;
      break;
  }

  return (
    <>
      {!isArtistRoute && (
        <>
          <SiteHeader user={user} isMoneystack={route.screen === 'moneystack'} onLogin={() => { sessionStorage.setItem('tejido_return_to', getRoute().screen); window.location.hash = 'login'; }} onLogout={handleLogout} />
          <main>{content}</main>
          <Footer />
          <HiloAssistant publications={publications} />
        </>
      )}
      {isArtistRoute && content}
    </>
  );
}
