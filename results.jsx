// ResolveAI v2 — Results (renders live Gemini output)
function Results({ setRoute }) {
  const [copied, setCopied] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const [draftVariant, setDraftVariant] = React.useState(0);

  const state = window.resolveState || {};
  const data = state.data || null;
  const apiError = state.error || null;

  // ── Error state ────────────────────────────────────────────────────────────
  if (apiError && !data) {
    return (
      <div className="fade-in">
        <section className="page results">
          <div className="results-head">
            <div className="topline">
              <span><span style={{ color: 'var(--mute)' }}>State —</span> <span style={{ color: 'var(--accent)' }}>analysis failed</span></span>
            </div>
            <h1>Something went <em>wrong.</em></h1>
            <p className="summary" style={{ color: 'var(--accent)' }}>{apiError}</p>
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

  // ── No data at all (direct URL access) ────────────────────────────────────
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

  // ── Destructure live data ──────────────────────────────────────────────────
  const {
    issue_type = 'Dispute',
    company_name = 'Unknown',
    severity = 'Medium',
    summary = '',
    recommended_action = '',
    confidence_score = 0,
    escalation_path = {},
    draft_emails = {},
  } = data;

  const {
    next_step = 'Escalation officer',
    expected_reply = 'Check with the company',
    fallback = 'Consumer Court',
    likelihood = 'Moderate',
  } = escalation_path;

  const drafts = [
    { label: 'Standard', body: draft_emails.standard || '' },
    { label: 'Firm', body: draft_emails.firm || '' },
    { label: 'Brief', body: draft_emails.brief || '' },
  ].filter((d) => d.body.trim().length > 0);

  // Fallback if Gemini only returned one draft
  const currentDraft = drafts[draftVariant] || drafts[0] || { label: 'Draft', body: '' };
  const wordCount = currentDraft.body.split(/\s+/).filter(Boolean).length;

  // Severity colour
  const sevColor = severity === 'High' ? 'var(--accent, #c0392b)' : severity === 'Low' ? 'var(--ink-2)' : 'var(--ink)';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(currentDraft.body).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleRegen = () => {
    if (drafts.length <= 1) return;
    setRegenerating(true);
    setTimeout(() => {
      setDraftVariant((v) => (v + 1) % drafts.length);
      setRegenerating(false);
    }, 500);
  };

  // Store current draft for Action page
  window.resolveState.activeDraft = currentDraft;
  window.resolveState.allDrafts = drafts;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      <section className="page results">

        {/* ── TOP — heading ─────────────────────────────────────── */}
        <div className="results-head">
          <div className="topline">
            <span>
              <span style={{ color: 'var(--mute)' }}>State —</span>{' '}
              <span className="acc">analysis complete</span>
            </span>
            <span style={{ color: 'var(--mute)' }}>{confidence_score}% confidence</span>
          </div>

          <h1>
            Here&rsquo;s<br />
            <em>what we found.</em>
          </h1>

          <p className="summary">{summary}</p>
        </div>

        <div className="results-grid">

          {/* ── § I — Dispute breakdown ───────────────────────────── */}
          <div>
            <div className="sec-head">
              <div className="num">§ I</div>
              <div className="lbl">
                <div className="title">Dispute breakdown</div>
                <div className="meta">
                  {company_name} · {issue_type.toLowerCase()}
                </div>
              </div>
            </div>

            <div className="breakdown-table">
              <div className="row">
                <span className="k">Issue type</span>
                <span className="v">
                  {issue_type} <em>—</em> {company_name}
                </span>
                <span></span>
              </div>

              <div className="row">
                <span className="k">Severity</span>
                <span className="v" style={{ color: sevColor }}>
                  {severity}
                </span>
                <span className="tag warn">{severity}</span>
              </div>

              <div className="row">
                <span className="k">Recommended action</span>
                <span className="v">
                  Escalate to <em>{next_step}</em>
                </span>
                <span className="tag accent">{next_step.split(' ')[0]}</span>
              </div>

              <div className="row">
                <span className="k">Confidence</span>
                <span className="v">
                  <span className="confidence-bar">
                    <span className="track">
                      <span
                        className="fill"
                        style={{ width: `${Math.min(100, Math.max(0, confidence_score))}%` }}
                      ></span>
                    </span>
                    <span className="pct">{confidence_score}%</span>
                  </span>
                </span>
                <span></span>
              </div>
            </div>
          </div>

          {/* ── § II — Recommendation ────────────────────────────────── */}
          <div>
            <div className="recommend">
              <h3 className="action">
                {recommended_action.length > 60
                  ? recommended_action.slice(0, recommended_action.lastIndexOf(' ', 55)) + '…'
                  : recommended_action}
              </h3>
              <p className="reason">
                {next_step} escalation is the correct channel for your case type. A written escalation,
                with attached evidence and a clear deadline, significantly increases the probability
                of resolution. If ignored, you have a direct path to {fallback}.
              </p>

              <div className="recommend-meta">
                <div className="item">
                  <div className="k">Expected reply</div>
                  <div className="v">{expected_reply}</div>
                </div>
                <div className="item">
                  <div className="k">Likelihood</div>
                  <div className="v">
                    <em>{likelihood}</em> — cohort data
                  </div>
                </div>
                <div className="item">
                  <div className="k">Fallback</div>
                  <div className="v">{fallback}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── § III — Draft email ──────────────────────────────────── */}
          <div>
            <div className="sec-head">
              <div className="num">§ III</div>
              <div className="lbl">
                <div className="title">Escalation draft</div>
                <div className="meta">
                  Tone · {currentDraft.label} · {wordCount} words
                </div>
              </div>
            </div>

            <div className="draft">
              <div className="draft-head">
                <span className="label">Draft / Tone · {currentDraft.label}</span>
                <div className="actions">
                  <button
                    className={'icon-btn' + (copied ? ' copied' : '')}
                    onClick={handleCopy}
                  >
                    {copied ? '✓ Copied' : '⎘ Copy'}
                  </button>
                  {drafts.length > 1 && (
                    <button className="icon-btn" onClick={handleRegen}>
                      ↻ Switch tone
                    </button>
                  )}
                </div>
              </div>

              <div
                className="draft-body"
                style={{
                  opacity: regenerating ? 0.4 : 1,
                  transition: 'opacity .3s',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {currentDraft.body}
              </div>

              <div className="draft-foot">
                <span>Generated by Gemini 2.5 Flash · personalise before sending</span>
                <div className="actions">
                  {drafts.length > 1 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setDraftVariant((v) => (v + 1) % drafts.length)}
                    >
                      Switch tone
                    </button>
                  )}
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => {
                      window.resolveState.activeDraft = currentDraft;
                      setRoute('action');
                    }}
                  >
                    Take action <span className="arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

window.Results = Results;
