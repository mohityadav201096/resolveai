// ResolveAI v2 — Nav (editorial masthead)
function Nav({ route, setRoute }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (r) => (e) => {
    e.preventDefault();
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <nav className={"nav" + (scrolled ? " is-scrolled" : "")}>
      <div className="nav-inner">
        <a href="#" onClick={go('landing')} className="nav-logo">
          <span>Resolve<em>AI</em></span>
          <span className="sub">est. 26</span>
        </a>
        <div className="nav-links">
          <a href="#how" onClick={go('landing')} className={route==='landing' ? 'is-active' : ''}>Method</a>
          <a href="#example" onClick={go('results')} className={route==='results' ? 'is-active' : ''}>Specimen</a>
          <a href="#privacy" onClick={(e)=>e.preventDefault()} className="hide-mobile">Privacy</a>
        </div>
      </div>
    </nav>
  );
}

window.Nav = Nav;
