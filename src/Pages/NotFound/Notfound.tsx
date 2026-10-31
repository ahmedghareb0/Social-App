import { Link } from "react-router-dom";

export default function Notfound() {
  return (
    <main className="page-container">
      <section className="empty-state">
        <h1 className="page-heading">Page not found</h1>
        <p className="page-subtitle">The page you requested does not exist.</p>
        <Link className="button" to="/">Return home</Link>
      </section>
    </main>
  );
}
