// ResolveAI v2 — Upload page (real API integration)
function Upload({ setRoute }) {
  const [dragging, setDragging] = React.useState(false);
  const [activeChip, setActiveChip] = React.useState(null);
  const [status, setStatus] = React.useState('idle'); // idle | reading | error
  const [errorMsg, setErrorMsg] = React.useState('');
  const inputRef = React.useRef(null);

  const chips = [
    'Refund delayed',
    'Flight cancelled',
    'Wrong product',
    'Return rejected',
    'No support response',
  ];

  // ── Global state store (shared with Processing + Results) ──────────────────
  // sessionId prevents a stale pending promise from clobbering a newer analysis
  const initResolveState = () => {
    window.resolveState = { promise: null, data: null, error: null, sessionId: Date.now() };
  };

  // ── Navigate to processing after kicking off the API call ─────────────────
  const startAnalysis = (apiPromise) => {
    initResolveState();
    window.resolveState.promise = apiPromise;
    setRoute('processing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // ── Analyse a real file ────────────────────────────────────────────────────
  const analyzeFile = (file) => {
    const MAX_MB = 4;
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrorMsg(`File is too large. Please upload a file under ${MAX_MB} MB.`);
      setStatus('error');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Unsupported file type. Please upload a JPG, PNG, WebP, or PDF.');
      setStatus('error');
      return;
    }

    setStatus('reading');
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      // Strip the "data:<mime>;base64," prefix — send only the raw base64 data
      const parts = reader.result.split(',');
      const base64 = parts.length > 1 ? parts[1] : null;
      if (!base64) {
        setErrorMsg('Could not read the file. Please try a different file.');
        setStatus('error');
        return;
      }
      const fetchPromise = fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64,
          mimeType: file.type,
          fileName: file.name,
        }),
      }).then((r) => r.json());

      // 28s client-side timeout — Vercel cuts the function at 30s
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ error: 'Analysis timed out. Please try again — if this keeps happening, try a smaller file.' }), 28000)
      );

      startAnalysis(Promise.race([fetchPromise, timeoutPromise]));
    };
    reader.onerror = () => {
      setErrorMsg('Could not read the file. Please try again.');
      setStatus('error');
    };
    reader.readAsDataURL(file);
  };

  // ── Analyse a chip description ─────────────────────────────────────────────
  const analyzeChip = () => {
    if (!activeChip) return;
    const fetchPromise = fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: activeChip }),
    }).then((r) => r.json());

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ error: 'Analysis timed out. Please try again.' }), 28000)
    );

    startAnalysis(Promise.race([fetchPromise, timeoutPromise]));
  };

  // ── Sample mode — pre-built mock, no API call ──────────────────────────────
  const useSample = () => {
    const mockData = {
      issue_type: 'Refund Delay',
      company_name: 'Sample Airline',
      severity: 'High',
      summary:
        "Your airline refund is delayed beyond the carrier's own stated timeline of 7–10 working days. Based on the ticket history, automated stalling is the likely cause. A direct nodal-officer escalation is the highest-leverage next move.",
      recommended_action:
        'Send a formal written escalation to the airline Nodal Officer, attaching all evidence, with a 7-day deadline before DGCA filing.',
      confidence_score: 92,
      escalation_path: {
        next_step: 'Nodal Officer',
        expected_reply: '5–7 business days',
        fallback: 'DGCA & Consumer Commission',
        likelihood: 'Strong',
      },
      draft_emails: {
        standard: `Subject: Refund escalation — PNR 4HQ8X2, ticket 88312 (day 34)

Dear Nodal Officer,

I am writing to escalate an unresolved refund for booking PNR 4HQ8X2. The flight was cancelled by the carrier on March 4, 2026. A refund was acknowledged on March 6 with a stated processing window of seven to ten working days. As of today, day 34, no credit has been issued.

I have followed up twice through ticket 88312. Both responses were automated and did not include a revised timeline or transaction reference. I am attaching the original booking confirmation, cancellation notice, and both follow-up tickets.

Under your published service commitments and DGCA regulations, I request the refund be processed and a confirmation of credit issued within seven calendar days. Failing this, I will file a formal complaint with DGCA and the consumer commission.

Regards,
[Your Name]
[Your Phone]
[Your Email]`,
        firm: `Subject: Final escalation before DGCA complaint — PNR 4HQ8X2

Dear Nodal Officer,

This is a formal escalation regarding an unresolved refund for booking PNR 4HQ8X2, cancelled by the carrier on March 4, 2026. Despite a stated 7–10 working day processing window, the refund is outstanding at day 34. Two follow-ups on ticket 88312 have received only automated responses with no transaction reference.

I require the refund to be credited within five calendar days, with written confirmation. If unresolved, I will immediately escalate to DGCA and file for compensation, including interest on the withheld amount.

Regards,
[Your Name]
[Your Phone]
[Your Email]`,
        brief: `Subject: Refund escalation — PNR 4HQ8X2 (day 34)

Dear Nodal Officer,

Refund for cancelled flight PNR 4HQ8X2 is outstanding 24 days past the stated timeline. Two follow-ups on ticket 88312 received automated replies only.

Please confirm processing within 7 calendar days. Attaching booking confirmation, cancellation notice, and prior correspondence.

Regards,
[Your Name]`,
      },
    };

    initResolveState();
    window.resolveState.promise = Promise.resolve(mockData);
    setRoute('processing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // ── Drag & drop handlers ───────────────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) analyzeFile(f);
  };
  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (f) analyzeFile(f);
    // Reset so the same file can be re-selected after an error
    e.target.value = '';
  };

  const isReading = status === 'reading';

  return (
    <div className="fade-in">
      <section className="page upload-shell">
        <div className="sec-head">
          <div className="num">§ I</div>
          <div className="lbl">
            <div className="title">Upload</div>
            <div className="meta">JPG · PNG · WebP · PDF · up to 4 MB</div>
          </div>
        </div>

        <h1 className="h1" style={{ maxWidth: '20ch', marginBottom: 24 }}>
          Let&rsquo;s see what <em>you&rsquo;re dealing with.</em>
        </h1>
        <p className="lede" style={{ marginBottom: 24 }}>
          Drop a screenshot, invoice, refund email, or full support thread. The file stays only as long as the analysis takes.
        </p>

        {/* Error message */}
        {status === 'error' && (
          <div style={{
            background: 'var(--accent-bg, #fff5f5)',
            border: '1px solid var(--accent, #c0392b)',
            borderRadius: 4,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 14,
            color: 'var(--accent, #c0392b)',
          }}>
            {errorMsg}
          </div>
        )}

        <div className="upload-grid">
          {/* ── Left: drop zone + chips ── */}
          <div>
            <div
              className={'dropzone' + (dragging ? ' is-dragging' : '') + (isReading ? ' is-loading' : '')}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !isReading && inputRef.current?.click()}
              role="button"
              tabIndex={0}
              style={{ cursor: isReading ? 'wait' : 'pointer' }}
            >
              <div className="stack-icon">
                {isReading ? (
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="22" cy="22" r="18" strokeDasharray="90 28" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                ) : (
                  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
                    <rect x="10" y="6" width="22" height="30" transform="rotate(-6 10 6)" opacity="0.3" />
                    <rect x="14" y="10" width="22" height="30" transform="rotate(3 14 10)" opacity="0.6" />
                    <rect x="14" y="12" width="22" height="30" />
                    <path d="M19 22h12M19 27h12M19 32h7" />
                  </svg>
                )}
              </div>

              {isReading ? (
                <>
                  <h3>Reading your file&hellip;</h3>
                  <p>Preparing for analysis. Just a moment.</p>
                </>
              ) : (
                <>
                  <h3>Drop your <em>file</em> here.</h3>
                  <p>Screenshot, invoice, refund email, or support conversation.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  >
                    Choose a file <span className="arrow">→</span>
                  </button>
                </>
              )}

              <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                style={{ display: 'none' }}
                onChange={onPick}
              />
              <div className="formats">JPG · PNG · WebP · PDF · 4 MB max</div>
            </div>

            {/* Chip quick-select */}
            <div style={{ marginTop: 36 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Or — describe in one tap</div>
              <div className="chips">
                {chips.map((c) => (
                  <button
                    key={c}
                    className={'chip' + (activeChip === c ? ' is-active' : '')}
                    onClick={() => setActiveChip(activeChip === c ? null : c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Analyze button appears when a chip is selected */}
              {activeChip && (
                <div style={{ marginTop: 20 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={analyzeChip}
                  >
                    Analyze &ldquo;{activeChip}&rdquo; <span className="arrow">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: sample preview ── */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingBottom: 14,
              borderBottom: '1px solid var(--ink)',
              marginBottom: 24,
              fontFamily: 'var(--mono)',
              fontSize: 10.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>
              <span>Sample · live</span>
              <span style={{ color: 'var(--mute)' }}>fig. 01</span>
            </div>

            <h4 style={{
              fontFamily: 'var(--serif)',
              fontSize: 28,
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.012em',
              margin: '0 0 12px 0',
            }}>
              What the <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>analysis</em> looks like.
            </h4>
            <p style={{
              color: 'var(--ink-2)',
              fontSize: 14,
              lineHeight: 1.55,
              margin: '0 0 24px 0',
              maxWidth: '42ch',
            }}>
              No file handy? Walk through the same flow on a realistic airline refund case.
            </p>

            <div className="analysis-card" style={{ marginBottom: 20 }}>
              <div className="head">
                <div className="title">Refund delay · airline</div>
                <div className="sev">High</div>
              </div>
              <div className="row"><span className="k">Issue</span><span className="leader"></span><span className="v">Refund delay</span></div>
              <div className="row"><span className="k">Days overdue</span><span className="leader"></span><span className="v">24</span></div>
              <div className="row"><span className="k">Path</span><span className="leader"></span><span className="v acc">Nodal officer</span></div>
              <div className="row"><span className="k">Confidence</span><span className="leader"></span><span className="v acc">92%</span></div>
            </div>

            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={useSample}>
              Use this sample <span className="arrow">→</span>
            </button>

            <p style={{
              marginTop: 32,
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--mute)',
              lineHeight: 1.7,
            }}>
              ∎ Transmitted over HTTPS<br />
              ∎ Not stored by our servers<br />
              ∎ No account required
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

window.Upload = Upload;
