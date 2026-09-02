import PublicationCard from './PublicationCard.jsx';

const kinds = [
  ['TODOS', 'Todo'],
  ['HISTORIA', 'Historias'],
  ['EVENTO', 'Eventos'],
  ['OPORTUNIDAD', 'Oportunidades'],
  ['TALENTO', 'Talento'],
  ['INICIATIVA', 'Iniciativas'],
];

export default function ExploreSection({ publications, activeKind, onKindChange, search, onSearchChange, loading, error }) {
  const filtered = publications.filter((publication) => {
    const matchesKind = activeKind === 'TODOS' || publication.kind === activeKind;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [publication.title, publication.summary, publication.location]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));
    return matchesKind && matchesSearch;
  });

  return (
    <section className="section" id="explorar">
      <div className="section-heading">
        <div><p className="eyebrow">Voces del territorio</p><h2>Descubre lo que se está tejiendo</h2></div>
        <p>Contenido local para encontrarnos, aprender y celebrar lo nuestro.</p>
      </div>
      <div className="toolbar">
        <div className="filters" aria-label="Filtrar publicaciones">
          {kinds.map(([value, label]) => (
            <button key={value} className={activeKind === value ? 'chip active' : 'chip'} type="button" onClick={() => onKindChange(value)}>{label}</button>
          ))}
        </div>
        <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar en Caucasia..." /></label>
      </div>
      {loading && <p className="status">Cargando publicaciones...</p>}
      {error && <p className="status error">{error}. Verifica que el backend Python esté activo en el puerto 8765.</p>}
      {!loading && !error && <div className="content-grid">{filtered.map((publication) => <PublicationCard key={publication.id} publication={publication} />)}</div>}
      {!loading && !error && filtered.length === 0 && <p className="status">No encontramos coincidencias.</p>}
    </section>
  );
}
