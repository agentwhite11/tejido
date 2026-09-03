export default function PublicationCard({ publication }) {
  const image = publication.image || '';
  const isGradient = image.startsWith('linear-gradient(');

  return (
    <article className="publication-card">
      <div
        className="publication-image"
        style={{ backgroundImage: isGradient ? image : `url("${image}")` }}
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
