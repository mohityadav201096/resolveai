// ResolveAI — Results
function Results({ setRoute }) {
  const [copied, setCopied] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const [draftVariant, setDraftVariant] = React.useState(() => {
    const requested = window.resolveState?.requestedVariant;
    if (!requested) return 0;
    window.resolveState.requestedVariant = null;
    const allDrafts = window.resolveState?.allDrafts || [];
    const idx = allDrafts.findIndex((d) => d.label === requested);
    return idx >= 0 ? idx : 0;
  });

  // Restore from sessionStorage if in-memory state is missing (e.g. page refresh)
  React.useEffect(() => {
    if (!window.resolveState?.data && !window.resolveState?.error) {
      try {
        const saved = sessionStorage.getItem('resolveai_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          window.resolveState = { ...window.resolveState, ...parsed };
        }
      } catch {}
    }
  }, []);

  const state = window.resolveState || {};
  const data = state.data || null;
  const apiError = state.error || null;

  // ── Error state ───────────────────────────────────────────────────────────
  if (apiError && !data) {
    return (
      <div className="fade-in">
        <section className="page results">
          <div className="results-head">
            <div className="topline">
              <span><span style={{ color: 'var(--mute)' }}>State —</span> <span style={{ color: 'var(--accent)' }}>analysis failed</span></span>
            </div>
            <h1>Something went <em>wrong.</em></h1>
            <p className="summary" style={{ color: 'var(--danger)' }}>{apiError}</p>
          </div>
          <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setRoute('upload'); window.scrollTo({ top: 0, behavior: 'instant' }); }}>
              Try again <span className="arrow">→</span>
            </button>
            <button className="btn btn-secondary" onClick={() => { setRoute('landing'); window.scrollTo({ top: 0, behavior: 'instant' }); }}>
              Back to home
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fade-in">
        <section className="page results">
          <div className="results-head">
            <h1>No analysis <em>found.</em></h1>
            <p className="summary">Please upload a document or describe your dispute first.</p>
          </div>
          <div style={{ marginTop: 40 }}>
            <button className="btn btn-primary" onClick={() => { setRoute('upload'); window.scrollTo({ top: 0, behavior: 'instant' }); }}>
              Start a dispute <span className="arrow">→</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  const {
    issue_type = 'Dispute',
    company_name = 'Unknown',
    severity = 'Medium',
    summary = '',
    recommended_action = '',
    confidence_score = 0,
    escalation_path = {},
    draft_emails = {},
    reply_classification = null,
  } = data;

  const { next_step = 'Escalation officer', expected_reply = '', fallback = 'Consumer Court', likelihood = 'Moderate' } = escalation_path;

  const drafts = [
    { label: 'Standard', body: draft_emails.standard || '' },
    { label: 'Firm', body: draft_emails.firm || '' },
    { label: 'Brief', body: draft_emails.brief || '' },
  ].filter((d) => d.body.trim().length > 0);

  const noDrafts = drafts.length === 0;
  const currentDraft = drafts[draftVariant] || drafts[0] || { label: 'Draft', body: '' };
  const wordCount = currentDraft.body.split(/\s+/).filter(Boolean).length;
  const displayCompany = company_name && company_name !== 'Unknown' ? company_name : null;
  const sevColor = severity === 'High' ? 'var(--danger)' : severity === 'Low' ? 'var(--ok)' : 'var(--warn)';
  const sevTag = severity === 'High' ? 'danger' : severity === 'Low' ? 'ok' : 'warn';

  // ── Static data lookups ────────────────────────────────────────────────────
  const RD = window.RESOLVE_DATA || {};
  const contactInfo = RD.findContact ? RD.findContact(company_name) : null;
  const evidenceList = (RD.evidence || {})[issue_type] || (RD.evidence || {})['Other'] || [];
  const regulatorInfo = (RD.regulators || {})[issue_type] || (RD.regulators || {})['Other'] || {};

  // ── Persist to sessionStorage for page refresh survival ───────────────────
  try {
    sessionStorage.setItem('resolveai_state', JSON.stringify({ data, error: null }));
  } catch {}

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(currentDraft.body).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleRegen = () => {
    if (drafts.length <= 1) return;
    setRegenerating(true);
    setTimeout(() => { setDraftVariant((v) => (v + 1) % drafts.length); setRegenerating(false); }, 500);
  };

  window.resolveState.activeDraft = currentDraft;
  window.resolveState.allDrafts = drafts;

  // Reply classification label
  const rcLabels = { genuine_resolution: 'Genuine resolution', stall: 'Stall', partial_resolution: 'Partial resolution', rejection: 'Rejection' };
  const rcColors = { genuine_resolution: 'ok', stall: 'warn', partial_resolution: 'warn', rejection: 'danger' };

  return (
    <div className="fade-in">
      <section className="page results">

        {/* ── TOP heading ───────────────────────────────────────────── */}
        <div className="results-head">
          <div className="topline">
            <span>
              <span style={{ color: 'var(--mute)' }}>State —</span>{' '}
              <span className="acc">
                {reply_classification ? 'response analysed' : 'analysis complete'}
              </span>
            </span>
            <span style={{ color: 'var(--mute)' }}>AI estimate · {confidence_score}%</span>
          </div>
          <h1>{reply_classification ? <>Their reply is a <em>{rcLabels[reply_classification] || reply_classification}.</em></> : <>Here&rsquo;s<br /><em>what we found.</em></>}</h1>
          <p className="summary">{summary}</p>
          {reply_classification && (
            <div style={{ marginTop: 12 }}>
              <span className={`tag ${rcColors[reply_classification] || 'warn'}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                {rcLabels[reply_classification] || reply_classification}
              </span>
            </div>
          )}
        </div>

        <div className="results-grid">

          {/* ── § I — Dispute breakdown ───────────────────────────────── */}
          <div>
            <div className="sec-head">
              <div className="num">§ I</div>
              <div className="lbl">
                <div className="title">Dispute breakdown</div>
                <div className="meta">{displayCompany ? `${displayCompany} · ` : ''}{issue_type.toLowerCase()}</div>
              </div>
            </div>
            <div className="breakdown-table">
              <div className="row">
                <span className="k">Issue type</span>
                <span className="v">{issue_type}{displayCompany ? <> <em>—</em> {displayCompany}</> : ''}</span>
                <span></span>
              </div>
              <div className="row">
                <span className="k">Severity</span>
                <span className="v" style={{ color: sevColor }}>{severity}</span>
                <span className={`tag ${sevTag}`}>{severity}</span>
              </div>
              <div className="row">
                <span className="k">Next step</span>
                <span className="v">Escalate to <em>{next_step}</em></span>
                <span className="tag accent">{next_step.split(' ')[0]}</span>
              </div>
              <div className="row">
                <span className="k">Confidence</span>
                <span className="v">
                  <span className="confidence-bar">
                    <span className="track"><span className="fill" style={{ width: `${Math.min(100, Math.max(0, confidence_score))}%` }}></span></span>
                    <span className="pct">{confidence_score}%</span>
                  </span>
                </span>
                <span></span>
              </div>

              {/* Contact finder row */}
              {contactInfo && (
                <div className="row" style={{ flexWrap: 'wrap', gap: 8, paddingTop: 12 }}>
                  <span className="k">Send to</span>
                  <span className="v" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {contactInfo.nodal && (
                      <a href={`mailto:${contactInfo.nodal}`} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}>
                        {contactInfo.nodal}
                        <span style={{ color: 'var(--mute)', fontWeight: 400 }}> (Nodal)</span>
                      </a>
                    )}
                    {contactInfo.support && !contactInfo.nodal && (
                      <a href={`mailto:${contactInfo.support}`} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}>
                        {contactInfo.support}
                      </a>
                    )}
                    {contactInfo.portal && (
                      <a href={contactInfo.portal} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mute)', fontSize: 13 }}>
                        Grievance portal ↗
                      </a>
                    )}
                  </span>
                  <span></span>
                </div>
              )}
            </div>
          </div>

          {/* ── § II — Recommendation ─────────────────────────────────── */}
          <div>
            <div className="sec-head">
              <div className="num">§ II</div>
              <div className="lbl">
                <div className="title">Recommended action</div>
                <div className="meta">{next_step} · {likelihood.toLowerCase()} likelihood</div>
              </div>
            </div>
            <div className="recommend">
              <p className="reason">{recommended_action}</p>
              <div className="recommend-meta">
                <div className="item"><div className="k">Expected reply</div><div className="v">{expected_reply}</div></div>
                <div className="item"><div className="k">Likelihood</div><div className="v"><em>{likelihood}</em> — AI estimate</div></div>
                <div className="item"><div className="k">Fallback</div><div className="v">{fallback}</div></div>
              </div>
            </div>
          </div>

          {/* ── § III — Draft email ───────────────────────────────────── */}
          <div>
            <div className="sec-head">
              <div className="num">§ III</div>
              <div className="lbl">
                <div className="title">Escalation draft</div>
                <div className="meta">{noDrafts ? 'No draft generated' : `Tone · ${currentDraft.label} · ${wordCount} words`}</div>
              </div>
            </div>
            {noDrafts ? (
              <div style={{ padding: '24px 0', color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6 }}>
                The analysis did not produce a draft email. Please try again.
                <div style={{ marginTop: 20 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => { setRoute('upload'); window.scrollTo({ top: 0, behavior: 'instant' }); }}>
                    Try again <span className="arrow">→</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="draft">
                <div className="draft-head">
                  <span className="label">Draft / Tone · {currentDraft.label}</span>
                  <div className="actions">
                    <button className={'icon-btn' + (copied ? ' copied' : '')} onClick={handleCopy}>
                      {copied ? '✓ Copied' : '⎘ Copy'}
                    </button>
                    {drafts.length > 1 && <button className="icon-btn" onClick={handleRegen}>↻ Switch tone</button>}
                  </div>
                </div>
                <div className="draft-body" style={{ opacity: regenerating ? 0.4 : 1, transition: 'opacity .3s', whiteSpace: 'pre-wrap' }}>
                  {currentDraft.body}
                </div>
                <div className="draft-foot">
                  <span>Generated by Gemini 2.5 Flash · personalise before sending</span>
                  <div className="actions">
                    {drafts.length > 1 && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setDraftVariant((v) => (v + 1) % drafts.length)}>Switch tone</button>
                    )}
                    <button className="btn btn-accent btn-sm" onClick={() => { window.resolveState.activeDraft = currentDraft; setRoute('action'); }}>
                      Take action <span className="arrow">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── § IV — Evidence checklist ─────────────────────────────── */}
          {evidenceList.length > 0 && (
            <div>
              <div className="sec-head">
                <div className="num">§ IV</div>
                <div className="lbl">
                  <div className="title">Evidence checklist</div>
                  <div className="meta">Gather these before escalating to the regulator</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {evidenceList.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: 'var(--bg-elev)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-2)' }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, border: '1.5px solid var(--line-2)', background: '#fff', flexShrink: 0, marginTop: 1 }}></span>
                    <span style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── § V — Regulator filing links ──────────────────────────── */}
          {(regulatorInfo.primary || regulatorInfo.secondary) && (
            <div>
              <div className="sec-head">
                <div className="num">§ V</div>
                <div className="lbl">
                  <div className="title">Escalate to regulator</div>
                  <div className="meta">Use these if the company ignores your emails</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[regulatorInfo.primary, regulatorInfo.secondary].filter(Boolean).map((reg, i) => (
                  <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-elev)', borderRadius: 'var(--radius)', border: '1px solid var(--line-2)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{reg.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--mute)', lineHeight: 1.5 }}>{reg.desc}</div>
                      {reg.helpline && <div style={{ fontSize: 12, color: 'var(--ok)', fontWeight: 600, marginTop: 4 }}>Helpline: {reg.helpline}</div>}
                    </div>
                    <a href={reg.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                      File complaint ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

window.Results = Results;
