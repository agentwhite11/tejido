export default function Logo({ href = '#inicio', showLocation = true, className = '' }) {
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>TEJIDO{showLocation && <small>CAUCASIA</small>}</span>
    </>
  );

  if (!href) {
    return <span className={`brand ${className}`.trim()}>{content}</span>;
  }

  return <a className={`brand ${className}`.trim()} href={href} aria-label="TEJIDO inicio">{content}</a>;
}
