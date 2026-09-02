import ExploreSection from '../components/ExploreSection.jsx';

export default function ExploreScreen({ publications, activeKind, onKindChange, search, onSearchChange, loading, error }) {
  return <ExploreSection publications={publications} activeKind={activeKind} onKindChange={onKindChange} search={search} onSearchChange={onSearchChange} loading={loading} error={error} />;
}
