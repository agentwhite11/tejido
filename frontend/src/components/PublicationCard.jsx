export default function PublicationCard({ publication }) {
  return (
    <article className="publication-card">
      <div
        className="publication-image"
        style={{ backgroundImage: `url("${publication.image}")` }}
        role="img"
        aria-label={publication.title}
      />
      <div className="publication-body">
        <span className="publication-kind">{publication.kind}</span>
        <h3>{publication.title}</h3>
        <p>{publication.summary}</p>
        <small>{publication.location || 'Caucasia'}</small>
      </div>
    </article>
  );
}
