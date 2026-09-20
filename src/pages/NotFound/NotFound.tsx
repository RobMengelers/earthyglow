import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="not-found">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>This page drifted away</h1>
        <p>
          The page you’re looking for doesn’t exist — but something warm and
          cozy probably does. Browse the collection instead.
        </p>
        <div className="hero-actions">
          <Link to="/" className="btn btn-primary">
            Back home
          </Link>
          <Link to="/shop" className="btn btn-ghost">
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  )
}