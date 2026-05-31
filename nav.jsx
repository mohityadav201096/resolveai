// ResolveAI — Nav (redesigned)
function Nav({ route, setRoute }) {
  return (
    <nav className="nav">
      <div className="nav-inner page">
        {/* Logo */}
        <button
          className="nav-logo"
          onClick={() => { setRoute('landing'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
        >
          <div className="nav-logo-icon">R</div>
          <span className="nav-logo-text">ResolveAI</span>
        </button>

        {/* Nav links */}
        <div className="nav-links">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#example" className="nav-link">Example</a>
          <a href="#privacy" className="nav-link">Privacy</a>
        </div>

        {/* CTA */}
        <button
          className="nav-cta btn btn-primary btn-sm"
          onClick={() => { setRoute('upload'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
        >
          Start free <span className="arrow">→</span>
        </button>
      </div>
    </nav>
  );
}

window.Nav = Nav;
