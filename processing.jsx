// ResolveAI v2 — Processing (awaits real API promise)
function Processing({ setRoute }) {
  const steps = [
    'Reading your document',
    'Understanding the dispute',
    'Identifying escalation paths',
    'Preparing recommendations',
  ];
  const [active, setActive] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const promise = window.resolveState?.promise;
    // Capture session ID at mount — guards against stale promises from a prior analysis
    const mySession = window.resolveState?.sessionId;

    // Guard: if someone lands here without a promise, send them back
    if (!promise) {
      setRoute('upload');
      return;
    }

    // Step animation — advances every ~1.6 s regardless of API speed
    let stepIdx = 0;
    let animRunning = true;
    const advance = () => {
      if (!animRunning) return;
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setActive(stepIdx);
      if (stepIdx < steps.length - 1) {
        setTimeout(advance, 1600);
      }
    };
    const animTimer = setTimeout(advance, 1600);

    // Wait for the API
    promise
      .then((data) => {
        animRunning = false;
        clearTimeout(animTimer);

        // If a newer analysis has started, discard this stale result
        if (window.resolveState?.sessionId !== mySession) return;

        if (data && data.error) {
          window.resolveState.error = data.error;
          window.resolveState.data = null;
        } else if (data && data.issue_type) {
          window.resolveState.data = data;
          window.resolveState.error = null;
        } else {
          window.resolveState.error = 'We received an unexpected response. Please try again.';
          window.resolveState.data = null;
        }

        setActive(steps.length - 1);
        setTimeout(() => {
          setRoute('results');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 700);
      })
      .catch(() => {
        animRunning = false;
        clearTimeout(animTimer);
        if (window.resolveState?.sessionId !== mySession) return;
        window.resolveState.error = 'Connection error. Please check your network and try again.';
        window.resolveState.data = null;
        setFailed(true);
        setTimeout(() => {
          setRoute('results');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 1200);
      });

    return () => {
      animRunning = false;
      clearTimeout(animTimer);
    };
  }, []);

  return (
    <div className="processing fade-in">
      <div className="page processing-card">
        <div className="processing-head">
          <span>
            <span style={{ color: 'var(--mute)' }}>State —</span>{' '}
            <span className="acc">{failed ? 'error' : 'in progress'}</span>
          </span>
          <span style={{ color: 'var(--mute)' }}>Gemini 2.5 Flash</span>
        </div>

        {!failed && <div className="processing-spinner"></div>}

        <div key={active} className="processing-msg fade-in">
          {failed ? 'Something went wrong…' : steps[active]}
        </div>

        <div className="processing-steps">
          {steps.map((s, i) => (
            <div
              key={s}
              className={
                'processing-step ' +
                (i < active ? 'done' : i === active ? 'active' : '')
              }
            >
              <span className="idx">{String(i + 1).padStart(2, '0')}</span>
              <span>{s}</span>
              <span className="status">
                {i < active
                  ? '— done'
                  : i === active
                  ? failed
                    ? '— error'
                    : '— running'
                  : '— queued'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.Processing = Processing;
