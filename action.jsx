// ResolveAI v2 — Action + Feedback
function ActionPage({ setRoute }) {
  return (
    <div className="fade-in">
      <section className="page upload-shell">
        <div className="sec-head">
          <div className="num">§ IV</div>
          <div className="lbl">
            <div className="title">Action</div>
            <div className="meta">Send · save · strengthen</div>
          </div>
        </div>

        <h1 className="h1" style={{maxWidth: '20ch', marginBottom: 24}}>
          Move it from your inbox <em>to theirs.</em>
        </h1>
        <p className="lede">
          Your draft is ready. Pick how you want to send it — the text and attachments stay aligned.
        </p>

        <div className="action-grid">
          <button className="action-tile" onClick={() => setRoute('feedback')}>
            <span className="idx">01</span>
            <span>
              <div className="label">Copy <em>escalation</em></div>
              <div className="desc">Drop into any email client</div>
            </span>
            <span className="arrow">→</span>
          </button>
          <button className="action-tile" onClick={() => setRoute('feedback')}>
            <span className="idx">02</span>
            <span>
              <div className="label">Open in <em>Gmail</em></div>
              <div className="desc">Pre-filled subject, recipient, body</div>
            </span>
            <span className="arrow">→</span>
          </button>
          <button className="action-tile" onClick={() => setRoute('feedback')}>
            <span className="idx">03</span>
            <span>
              <div className="label">Download <em>PDF</em></div>
              <div className="desc">Bundle draft + evidence</div>
            </span>
            <span className="arrow">→</span>
          </button>
          <button className="action-tile" onClick={() => setRoute('feedback')}>
            <span className="idx">04</span>
            <span>
              <div className="label">Generate <em>stronger</em></div>
              <div className="desc">Adds regulator-level pressure</div>
            </span>
            <span className="arrow">→</span>
          </button>
        </div>

        <p style={{
          marginTop: 56,
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 22,
          lineHeight: 1.4,
          color: 'var(--ink-2)',
          maxWidth: '52ch',
          letterSpacing: '-0.008em'
        }}>
          Clear escalation language improves response probability roughly three times in cases similar to yours.
        </p>

        <FeedbackBlock />
      </section>
    </div>
  );
}

function FeedbackBlock() {
  const [selected, setSelected] = React.useState(null);
  const options = ['Got refund', 'Company responded', 'Still unresolved'];
  return (
    <div className="feedback">
      <div className="topline">§ V — close the loop</div>
      <h3>Did this <em>help?</em></h3>
      <div className="feedback-options">
        {options.map((o) => (
          <button
            key={o}
            className={"feedback-opt" + (selected === o ? ' is-selected' : '')}
            onClick={() => setSelected(o)}
          >
            {o}
          </button>
        ))}
      </div>
      <div className={"feedback-thanks" + (selected ? ' show' : '')}>
        {selected === 'Got refund' && '— Excellent. We learn from every win.'}
        {selected === 'Company responded' && '— Good. Keep us posted if you need a follow-up draft.'}
        {selected === 'Still unresolved' && '— We\u2019ll suggest the next escalation tier. Check your inbox.'}
      </div>
    </div>
  );
}

// Standalone feedback page (after pressing an action tile)
function Feedback({ setRoute }) {
  return (
    <div className="fade-in">
      <section className="page upload-shell" style={{maxWidth: 880, margin:'0 auto'}}>
        <div className="sec-head">
          <div className="num">§ V</div>
          <div className="lbl">
            <div className="title">Sent</div>
            <div className="meta">Awaiting reply</div>
          </div>
        </div>

        <h1 className="h1" style={{maxWidth: '18ch', marginBottom: 24}}>
          Your escalation is <em>on its way.</em>
        </h1>
        <p className="lede" style={{marginBottom: 0}}>
          We&rsquo;ll keep this draft available for an hour, then it&rsquo;s gone.
        </p>

        <FeedbackBlock />

        <div style={{marginTop: 56, paddingTop: 32, borderTop:'1px solid var(--line)', display:'flex', gap:16, flexWrap:'wrap'}}>
          <button className="btn btn-secondary" onClick={() => { setRoute('landing'); window.scrollTo({top:0,behavior:'instant'}); }}>
            Start a new dispute <span className="arrow">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}

window.ActionPage = ActionPage;
window.Feedback = Feedback;
