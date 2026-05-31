// ResolveAI — Response Analyzer page
function ResponseAnalyzer({ setRoute }) {
  const [replyText, setReplyText] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = React.useState('');

  // Restore original context from sessionStorage if needed
  React.useEffect(() => {
    if (!window.resolveState?.data) {
      try {
        const saved = sessionStorage.getItem('resolveai_state');
        if (saved) { const p = JSON.parse(saved); window.resolveState = { ...(window.resolveState || {}), ...p }; }
      } catch {}
    }
  }, []);

  const originalData = window.resolveState?.data || null;

  const handleAnalyze = async () => {
    if (!replyText.trim()) { setErrorMsg('Please paste the company reply first.'); setStatus('error'); return; }
    if (!originalData) { setErrorMsg('Original dispute context missing. Please start a new analysis first.'); setStatus('error'); return; }

    setStatus('loading');
    setErrorMsg('');

    const originalContext = JSON.stringify({
      issue_type: originalData.issue_type,
      company_name: originalData.company_name,
      severity: originalData.severity,
      escalation_path: originalData.escalation_path,
      summary: originalData.summary,
      recommended_action: originalData.recommended_action,
    });

    try {
      const fetchPromise = fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'analyze-response', originalContext, companyReply: replyText }),
      }).then((r) => r.json());
      const timeout = new Promise((resolve) => setTimeout(() => resolve({ error: 'Analysis timed out. Please try again.' }), 28000));
      const result = await Promise.race([fetchPromise, timeout]);

      if (result.error) {
        setErrorMsg(result.error);
        setStatus('error');
        return;
      }

      window.resolveState = { ...(window.resolveState || {}), data: result, error: null, sessionId: Date.now(), promise: null };
      try { sessionStorage.setItem('resolveai_state', JSON.stringify({ data: result, error: null })); } catch {}
      setRoute('results');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const charCount = replyText.length;
  const MAX_CHARS = 4000;

  return (
    <div className="fade-in">
      <section className="page upload-shell">
        <div className="sec-head">
          <div className="num">§ R</div>
          <div className="lbl">
            <div className="title">Analyse their reply</div>
            <div className="meta">Paste what the company sent you</div>
          </div>
        </div>

        <h1 className="h1" style={{ maxWidth: '24ch', marginBottom: 16 }}>
          What did <em>they say?</em>
        </h1>
        <p className="lede" style={{ marginBottom: 32 }}>
          Paste the company reply below. We will classify it — genuine resolution, stall, partial, or rejection — and generate your counter-response.
        </p>

        {/* Context pill — shows what original dispute this is linked to */}
        {originalData && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-soft)', border: '1px solid var(--accent-mid)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: 'var(--accent)', marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}></span>
            Linked to: {originalData.issue_type} — {originalData.company_name !== 'Unknown' ? originalData.company_name : 'your dispute'}
          </div>
        )}

        {!originalData && (
          <div style={{ background: 'var(--warn-soft)', border: '1px solid var(--warn)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 24, fontSize: 14, color: 'var(--warn)' }}>
            No original dispute found. Please <button className="btn btn-ghost btn-sm" style={{ display: 'inline', padding: '2px 8px' }} onClick={() => { setRoute('upload'); window.scrollTo({ top: 0, behavior: 'instant' }); }}>start a new analysis</button> first.
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 24, fontSize: 14, color: 'var(--danger)' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: 8 }}>
          <textarea
            value={replyText}
            onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setReplyText(e.target.value); }}
            placeholder={'Paste the company\'s email reply here...\n\nExample: "Dear Customer, Thank you for reaching out. We have reviewed your complaint and our team is working on it. We will get back to you within 7-10 business days..."'}
            rows={12}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius)',
              border: '1.5px solid var(--line-2)', fontSize: 14, fontFamily: 'inherit',
              lineHeight: 1.65, color: 'var(--ink)', background: '#fff', resize: 'vertical',
              outline: 'none', transition: 'border-color .15s', boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--line-2)'; }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, fontSize: 12, color: 'var(--mute)' }}>
          <span>{charCount} / {MAX_CHARS} characters</span>
          {replyText && <button style={{ fontSize: 12, color: 'var(--mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setReplyText('')}>Clear</button>}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={status === 'loading' || !replyText.trim()}
            style={{ opacity: status === 'loading' ? 0.7 : 1 }}
          >
            {status === 'loading' ? 'Analysing...' : 'Analyse reply'} <span className="arrow">→</span>
          </button>
          <button className="btn btn-secondary" onClick={() => { setRoute('results'); window.scrollTo({ top: 0, behavior: 'instant' }); }}>
            Back to results
          </button>
        </div>

        <div style={{ marginTop: 48, padding: '20px 24px', background: 'var(--bg-elev)', borderRadius: 'var(--radius)', border: '1px solid var(--line-2)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>What we classify</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {[
              { label: 'Genuine resolution', color: 'var(--ok)', desc: 'Specific date or transaction ID given' },
              { label: 'Stall', color: 'var(--warn)', desc: 'Vague, no timeline, auto-reply' },
              { label: 'Partial resolution', color: 'var(--warn)', desc: 'Less than what was owed' },
              { label: 'Rejection', color: 'var(--danger)', desc: 'Claim explicitly refused' },
            ].map((c) => (
              <div key={c.label} style={{ padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid var(--line-2)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 3 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: 'var(--mute)', lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}

window.ResponseAnalyzer = ResponseAnalyzer;
