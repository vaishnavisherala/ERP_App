import "./PageHeader.css";

export default function PageHeader({ title, company }) {
  // Get initials (Pushpa Textile -> PT)
  const initials = company
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="page-header">
      <h2 className="page-title">{title}</h2>

      <div className="company-info">
        <div className="company-avatar">{initials}</div>
        <span className="company-name">{company}</span>
      </div>
    </div>
  );
}
