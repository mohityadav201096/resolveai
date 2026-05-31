// ResolveAI — Landing page (redesigned)
function Landing({ setRoute }) {
  const chips = [
    { label: 'Refund delayed', emoji: '💸' },
    { label: 'Flight cancelled', emoji: '✈️' },
    { label: 'Wrong product', emoji: '📦' },
    { label: 'Return rejected', emoji: '🚫' },
    { label: 'No support response', emoji: '📵' },
    { label: 'Billing error', emoji: '🧾' },
    { label: 'Food delivery issue', emoji: '🍔' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Upload your document',
      desc: 'Drop a screenshot, invoice, refund email, or support thread. Any format — JPG, PNG, PDF.',
    },
    {
      num: '02',
      title: 'AI reads the dispute',
      desc: 'Gemini 2.5 Flash analyses the issue, identifies the right legal hooks, and maps your escalation path.',
    },
    {
      num: '03',
      title: 'Send the escalation',
      desc: 'Get a ready-to-send escalation email in three tones. Copy it, open Gmail, or download as PDF.',
    },
  ];

  const handleChip = (chip) => {
    // Pre-fill as description and start analysis
    const fetchPromise = fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: chip.label }),
    }).then((r) => r.json());

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ error: 'Analysis timed out. Please try again.' }), 28000)
    );

    window.resolveState = { promise: null, data: null, error: null, sessionId: Date.now() };
    window.resolveState.promise = Promise.race([fetchPromise, timeoutPromise]);
    setRoute('processing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="fade-in">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="page hero-inner">
          <div className="hero-badge">AI-powered · Indian Consumer Rights</div>

          <h1 className="hero-display">
            Fight back against<br />
            <em>bad customer service.</em>
          </h1>

          <p className="hero-sub">
            Upload your complaint, invoice, or support thread. ResolveAI reads it,
            maps your escalation path under Indian consumer law, and writes the email for you.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => { setRoute('upload'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            >
              Analyse my dispute <span className="arrow">→</span>
            </button>
            <span className="hero-note">Free · No account required</span>
          </div>

          {/* Trust strip */}
          <div className="trust-strip">
            <div className="trust-row">
              <span className="trust-item">✓ DGCA & Consumer Protection Act 2019</span>
              <span className="trust-item">✓ Railway Claims Tribunal Act</span>
              <span className="trust-item">✓ FSSAI Food Safety Rules</span>
              <span className="trust-item">✓ E-Commerce Rules 2020</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT ARE YOU DEALING WITH ─────────────────────────── */}
      <section className="chips-section">
        <div className="page">
          <div className="chips-head">
            <h2>What are you dealing with?</h2>
            <p>Pick a category to get an instant analysis — no file needed.</p>
          </div>
          <div className="chips chips-lg">
            {chips.map((c) => (
              <button
                key={c.label}
                className="chip chip-landing"
                onClick={() => handleChip(c)}
              >
                <span className="chip-emoji">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="steps-section">
        <div className="page">
          <div className="section-label">How it works</div>
          <h2 className="section-title">Three steps to your escalation</h2>

          <div className="steps-grid">
            {steps.map((s) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYSIS PREVIEW ─────────────────────────────────── */}
      <section className="preview-section">
        <div className="page preview-inner">
          <div className="preview-text">
            <div className="section-label">Example output</div>
            <h2 className="section-title">This is what you get</h2>
            <p className="preview-desc">
              ResolveAI doesn't just identify your issue — it gives you the exact email to send,
              the regulatory body to cite, and a realistic timeline for resolution.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => { setRoute('upload'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            >
              Try it on your dispute <span className="arrow">→</span>
            </button>
          </div>

          <div className="preview-card">
            {/* Card header */}
            <div className="preview-card-head">
              <div>
                <div className="preview-card-label">Dispute Analysis</div>
                <div className="preview-card-company">IndiGo Airlines</div>
              </div>
              <span className="tag danger">High</span>
            </div>

            {/* Rows */}
            <div className="preview-rows">
              <div className="preview-row">
                <span className="preview-k">Issue type</span>
                <span className="preview-v">Flight Cancelled</span>
              </div>
              <div className="preview-row">
                <span className="preview-k">Overdue by</span>
                <span className="preview-v">24 days</span>
              </div>
              <div className="preview-row">
                <span className="preview-k">Escalation path</span>
                <span className="preview-v accent">Nodal Officer → DGCA</span>
              </div>
              <div className="preview-row">
                <span className="preview-k">Confidence</span>
                <span className="preview-v">
                  <span className="confidence-bar">
                    <span className="track">
                      <span className="fill" style={{ width: '88%' }}></span>
                    </span>
                    <span className="pct">88%</span>
                  </span>
                </span>
              </div>
            </div>

            {/* Draft preview */}
            <div className="preview-draft">
              <div className="preview-draft-label">Escalation Draft · Standard tone</div>
              <div className="preview-draft-body">
                Subject: Refund escalation — PNR 4HQ8X2, ticket 88312 (day 24)
                {'\n\n'}
                Dear Nodal Officer,{'\n\n'}
                I am writing to escalate an unresolved refund for booking PNR 4HQ8X2.
                The flight was cancelled by the carrier on March 4, 2026...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="page cta-inner">
          <h2 className="cta-title">Ready to escalate?</h2>
          <p className="cta-sub">
            Upload your document or describe your dispute. Takes under 30 seconds.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => { setRoute('upload'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
          >
            Start for free <span className="arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="page footer-inner">
          <div className="footer-logo">
            <div className="nav-logo-icon">R</div>
            <span className="footer-name">ResolveAI</span>
          </div>
          <div className="footer-links">
            <a href="#how" className="footer-link">How it works</a>
            <a href="#privacy" className="footer-link">Privacy</a>
          </div>
          <div className="footer-note">
            AI analysis only — not legal advice. Verify with a professional before legal action.
          </div>
        </div>
      </footer>

    </div>
  );
}

window.Landing = Landing;
