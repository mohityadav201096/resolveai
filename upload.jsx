// ResolveAI — Upload page (multi-document support)
function Upload({ setRoute }) {
  const [dragging, setDragging] = React.useState(false);
  const [activeChip, setActiveChip] = React.useState(null);
  const [status, setStatus] = React.useState('idle'); // idle | reading | error
  const [errorMsg, setErrorMsg] = React.useState('');
  const [selectedFiles, setSelectedFiles] = React.useState([]); // [{ name, type, size, base64 }]
  const inputRef = React.useRef(null);

  const chips = ['Refund delayed', 'Flight cancelled', 'Wrong product', 'Return rejected', 'No support response'];
  const MAX_FILES = 3;
  const MAX_MB = 3;
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  const initResolveState = () => {
    window.resolveState = { promise: null, data: null, error: null, sessionId: Date.now() };
    try { sessionStorage.removeItem('resolveai_state'); } catch {}
  };

  const startAnalysis = (apiPromise) => {
    initResolveState();
    window.resolveState.promise = apiPromise;
    setRoute('processing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // ── Read a File object → base64 ───────────────────────────────────────────
  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parts = reader.result.split(',');
      const b64 = parts.length > 1 ? parts[1] : null;
      b64 ? resolve(b64) : reject(new Error('Could not read file.'));
    };
    reader.onerror = () => reject(new Error('File read error.'));
    reader.readAsDataURL(file);
  });

  // ── Validate + add file(s) to selectedFiles ───────────────────────────────
  const addFiles = async (incoming) => {
    setErrorMsg('');
    const toAdd = Array.from(incoming);

    if (selectedFiles.length + toAdd.length > MAX_FILES) {
      setErrorMsg(`Maximum ${MAX_FILES} files. Remove one first.`);
      setStatus('error');
      return;
    }
    for (const f of toAdd) {
      if (!ALLOWED.includes(f.type)) {
        setErrorMsg(`Unsupported type: ${f.name}. Use JPG, PNG, WebP, or PDF.`);
        setStatus('error');
        return;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setErrorMsg(`${f.name} is too large. Max ${MAX_MB} MB per file.`);
        setStatus('error');
        return;
      }
    }

    setStatus('reading');
    try {
      const results = await Promise.all(toAdd.map(async (f) => ({
        name: f.name, type: f.type, size: f.size,
        base64: await readFileAsBase64(f),
      })));
      setSelectedFiles((prev) => [...prev, ...results]);
      setStatus('idle');
    } catch (e) {
      setErrorMsg(e.message || 'Could not read file.');
      setStatus('error');
    }
  };

  const removeFile = (idx) => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));

  // ── Analyse selected files ────────────────────────────────────────────────
  const analyzeFiles = () => {
    if (selectedFiles.length === 0) return;
    const filesPayload = selectedFiles.map((f) => ({ file: f.base64, mimeType: f.type, fileName: f.name }));
    const fetchPromise = fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: filesPayload, mode: 'analyze' }),
    }).then((r) => r.json());
    const timeout = new Promise((resolve) => setTimeout(() => resolve({ error: 'Analysis timed out. Please try again.' }), 28000));
    startAnalysis(Promise.race([fetchPromise, timeout]));
  };

  // ── Analyse chip description ──────────────────────────────────────────────
  const analyzeChip = () => {
    if (!activeChip) return;
    const fetchPromise = fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: activeChip, mode: 'analyze' }),
    }).then((r) => r.json());
    const timeout = new Promise((resolve) => setTimeout(() => resolve({ error: 'Analysis timed out. Please try again.' }), 28000));
    startAnalysis(Promise.race([fetchPromise, timeout]));
  };

  // ── Sample ────────────────────────────────────────────────────────────────
  const useSample = () => {
    const mockData = {
      issue_type: 'Refund Delay', company_name: 'Sample Airline', severity: 'High',
      summary: 'Your airline refund is delayed beyond the carrier\'s own stated timeline of 7-10 working days. Based on the ticket history, automated stalling is the likely cause. A direct nodal-officer escalation is the highest-leverage next move.',
      recommended_action: 'Send a formal written escalation to the airline Nodal Officer, attaching all evidence, with a 7-day deadline before DGCA filing.',
      confidence_score: 92,
      escalation_path: { next_step: 'Nodal Officer', expected_reply: '5-7 business days', fallback: 'DGCA & Consumer Commission', likelihood: 'Strong' },
      draft_emails: {
        standard: `Subject: Refund escalation -- PNR 4HQ8X2, ticket 88312 (day 34)\n\nDear Nodal Officer,\n\nI am writing to escalate an unresolved refund for booking PNR 4HQ8X2. The flight was cancelled by the carrier on March 4, 2026. A refund was acknowledged on March 6 with a stated processing window of seven to ten working days. As of today, day 34, no credit has been issued.\n\nI have followed up twice through ticket 88312. Both responses were automated. I request the refund be processed within seven calendar days. Failing this, I will file a formal complaint with DGCA.\n\nRegards,\n[Your Name]\n[Your Phone]\n[Your Email]`,
        firm: `Subject: Final escalation before DGCA complaint -- PNR 4HQ8X2\n\nDear Nodal Officer,\n\nThis is a formal escalation. Refund for PNR 4HQ8X2 cancelled March 4, 2026 is outstanding at day 34. Two follow-ups received only automated responses.\n\nI require the refund within five calendar days. If unresolved, I will escalate to DGCA immediately.\n\nRegards,\n[Your Name]\n[Your Phone]\n[Your Email]`,
        brief: `Subject: Refund escalation -- PNR 4HQ8X2 (day 34)\n\nDear Nodal Officer,\n\nRefund for PNR 4HQ8X2 is outstanding 24 days past the stated timeline. Two follow-ups received automated replies only. Please confirm processing within 7 calendar days.\n\nRegards,\n[Your Name]`,
      },
    };
    initResolveState();
    window.resolveState.promise = Promise.resolve(mockData);
    setRoute('processing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); };
  const onPick = (e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; };

  const isReading = status === 'reading';
  const canAnalyze = selectedFiles.length > 0 && !isReading;
  const canAddMore = selectedFiles.length < MAX_FILES;

  return (
    <div className="fade-in">
      <section className="page upload-shell">
        <div className="sec-head">
          <div className="num">§ I</div>
          <div className="lbl">
            <div className="title">Upload</div>
            <div className="meta">JPG · PNG · WebP · PDF · up to {MAX_FILES} files · {MAX_MB} MB each</div>
          </div>
        </div>

        <h1 className="h1" style={{ maxWidth: '20ch', marginBottom: 24 }}>
          Let&rsquo;s see what <em>you&rsquo;re dealing with.</em>
        </h1>
        <p className="lede" style={{ marginBottom: 24 }}>
          Drop screenshots, invoices, refund emails, or a full support thread. Upload up to 3 files — we read them all together.
        </p>

        {status === 'error' && (
          <div style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 24, fontSize: 14, color: 'var(--danger)' }}>
            {errorMsg}
          </div>
        )}

        <div className="upload-grid">
          {/* ── Left: dropzone + file list + chips ── */}
          <div>

            {/* Selected file pills */}
            {selectedFiles.length > 0 && (
              <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-soft)', border: '1px solid var(--accent-mid)', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: 'var(--accent)' }}>
                    <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ color: 'var(--mute)', fontSize: 11 }}>({(f.size / 1024).toFixed(0)}KB)</span>
                    <button onClick={() => removeFile(i)} style={{ marginLeft: 4, color: 'var(--mute)', fontWeight: 700, fontSize: 14, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="Remove file">×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Dropzone */}
            {canAddMore && (
              <div
                className={'dropzone' + (dragging ? ' is-dragging' : '') + (isReading ? ' is-loading' : '')}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => !isReading && inputRef.current?.click()}
                role="button" tabIndex={0} style={{ cursor: isReading ? 'wait' : 'pointer' }}
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
                  <><h3>Reading your file&hellip;</h3><p>Preparing for analysis.</p></>
                ) : selectedFiles.length > 0 ? (
                  <><h3>Add another <em>file</em></h3><p>{MAX_FILES - selectedFiles.length} more slot{MAX_FILES - selectedFiles.length !== 1 ? 's' : ''} available.</p></>
                ) : (
                  <>
                    <h3>Drop your <em>file</em> here.</h3>
                    <p>Screenshot, invoice, refund email, or support conversation.</p>
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                      Choose a file <span className="arrow">→</span>
                    </button>
                  </>
                )}
                <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" multiple style={{ display: 'none' }} onChange={onPick} />
                <div className="formats">JPG · PNG · WebP · PDF · {MAX_MB} MB max per file</div>
              </div>
            )}

            {/* Analyse button */}
            {canAnalyze && (
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={analyzeFiles}>
                  Analyse {selectedFiles.length > 1 ? `${selectedFiles.length} files` : 'file'} <span className="arrow">→</span>
                </button>
              </div>
            )}

            {/* Chip quick-select */}
            <div style={{ marginTop: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Or describe in one tap</div>
              <div className="chips">
                {chips.map((c) => (
                  <button key={c} className={'chip' + (activeChip === c ? ' is-active' : '')} onClick={() => setActiveChip(activeChip === c ? null : c)}>
                    {c}
                  </button>
                ))}
              </div>
              {activeChip && (
                <div style={{ marginTop: 16 }}>
                  <button className="btn btn-primary btn-sm" onClick={analyzeChip}>
                    Analyze &ldquo;{activeChip}&rdquo; <span className="arrow">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: sample preview ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 14, borderBottom: '1px solid var(--line-2)', marginBottom: 24, fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--mute)' }}>
              <span>Sample · live</span>
              <span>fig. 01</span>
            </div>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.012em', margin: '0 0 12px 0', color: 'var(--ink)' }}>
              What the <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>analysis</em> looks like.
            </h4>
            <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.55, margin: '0 0 24px 0', maxWidth: '42ch' }}>
              No file handy? Walk through the same flow on a realistic airline refund case.
            </p>
            <div className="analysis-card" style={{ marginBottom: 20 }}>
              <div className="head"><div className="title">Refund delay · airline</div><div className="sev">High</div></div>
              <div className="row"><span className="k">Issue</span><span className="leader"></span><span className="v">Refund delay</span></div>
              <div className="row"><span className="k">Days overdue</span><span className="leader"></span><span className="v">24</span></div>
              <div className="row"><span className="k">Path</span><span className="leader"></span><span className="v acc">Nodal officer</span></div>
              <div className="row"><span className="k">Confidence</span><span className="leader"></span><span className="v acc">92%</span></div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={useSample}>
              Use this sample <span className="arrow">→</span>
            </button>
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--mute)', lineHeight: 1.5 }}>
              Your files are read once for analysis and never stored on our servers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

window.Upload = Upload;
