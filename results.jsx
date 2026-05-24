// ResolveAI v2 — Results (the magic moment)
function Results({ setRoute }) {
  const [copied, setCopied] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const [draftVariant, setDraftVariant] = React.useState(0);

  const drafts = [
    {
      label: 'Standard',
      body:
`Subject: Refund escalation — PNR 4HQ8X2, ticket 88312 (day 34)

To: nodal.officer@aircarrier.example
Cc: customer.relations@aircarrier.example

Dear Nodal Officer,

I am writing to escalate an unresolved refund for booking PNR 4HQ8X2. The flight was cancelled by the carrier on March 4, 2026. A refund was acknowledged on March 6 with a stated processing window of seven to ten working days. As of today, day 34, no credit has been issued.

I have followed up twice through ticket 88312. Both responses were automated and did not include a revised timeline or transaction reference. I am attaching the original booking confirmation, cancellation notice, and both follow-up tickets.

Under your published service commitments, I request the refund be processed and a confirmation of credit issued within seven calendar days. Failing this, I will file a formal complaint with the appropriate regulatory authority and the consumer commission.

I would appreciate a written response with a clear timeline.

Regards,
[Your name]
[Phone number]
[Email]`
    },
    {
      label: 'Firm',
      body:
`Subject: Final escalation before regulatory complaint — PNR 4HQ8X2

To: nodal.officer@aircarrier.example
Cc: customer.relations@aircarrier.example

Dear Nodal Officer,

This is a formal escalation regarding the unresolved refund for booking PNR 4HQ8X2, cancelled by the carrier on March 4, 2026. Despite a stated seven to ten working day processing window, the refund has not been issued at day 34. Two follow-ups on ticket 88312 have returned only automated responses with no transaction reference.

I am requesting the refund be credited within five calendar days, accompanied by written confirmation. If this is not resolved, I will escalate to the regulator and pursue compensation for the delay, including interest for the period the funds were withheld.

I have attached the booking confirmation, cancellation notice, and previous correspondence.

Regards,
[Your name]
[Phone number]
[Email]`
    },
    {
      label: 'Brief',
      body:
`Subject: Refund escalation — PNR 4HQ8X2 (day 34)

To: nodal.officer@aircarrier.example

Dear Nodal Officer,

Refund for cancelled flight, PNR 4HQ8X2, is outstanding 24 days beyond the stated timeline. Two follow-ups on ticket 88312 received automated replies only.

Please confirm processing within seven calendar days. Attaching booking, cancellation, and prior correspondence.

Regards,
[Your name]`
    },
  ];

  const handleCopy = () => {
    const text = drafts[draftVariant].body;
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleRegen = () => {
    setRegenerating(true);
    setTimeout(() => {
      setDraftVariant((draftVariant + 1) % drafts.length);
      setRegenerating(false);
    }, 700);
  };

  return (
    <div className="fade-in">
      <section className="page results">
        {/* TOP — heading */}
        <div className="results-head">
          <div className="topline">
            <span><span style={{color:'var(--mute)'}}>State —</span> <span className="acc">analysis complete</span></span>
            <span style={{color:'var(--mute)'}}>14.2s · 92% confidence</span>
          </div>

          <h1>
            Here&rsquo;s<br/>
            <em>what we found.</em>
          </h1>

          <p className="summary">
            Your airline refund is delayed beyond the carrier&rsquo;s own stated timeline. Based on message tone and ticket history, automated stalling is likely. A direct nodal-officer escalation is the highest-leverage next move.
          </p>
        </div>

        <div className="results-grid">
          {/* § I — BREAKDOWN */}
          <div>
            <div className="sec-head">
              <div className="num">§ I</div>
              <div className="lbl">
                <div className="title">Dispute breakdown</div>
                <div className="meta">Case 2491 · classified</div>
              </div>
            </div>
            <div className="breakdown-table">
              <div className="row">
                <span className="k">Issue type</span>
                <span className="v">Refund delay <em>—</em> flight cancellation</span>
                <span></span>
              </div>
              <div className="row">
                <span className="k">Severity</span>
                <span className="v">High <em>—</em> funds held 24 days past commitment</span>
                <span className="tag warn">High</span>
              </div>
              <div className="row">
                <span className="k">Company risk</span>
                <span className="v">Likely <em>stall</em> — automated replies, no ETA</span>
                <span className="tag warn">Stall</span>
              </div>
              <div className="row">
                <span className="k">Recommended action</span>
                <span className="v">Escalate to <em>nodal officer</em>, 7-day window</span>
                <span className="tag accent">Nodal</span>
              </div>
              <div className="row">
                <span className="k">Confidence</span>
                <span className="v">
                  <span className="confidence-bar">
                    <span className="track"><span className="fill" style={{width:'92%'}}></span></span>
                    <span className="pct">92%</span>
                  </span>
                </span>
                <span></span>
              </div>
            </div>
          </div>

          {/* § II — RECOMMENDATION (magic moment) */}
          <div>
            <div className="recommend">
              <h3 className="action">
                Escalate to the airline&rsquo;s<br/>
                <em>nodal officer.</em>
              </h3>
              <p className="reason">
                Nodal officers are designated for unresolved cases that exceed the carrier&rsquo;s own service timeline. A written escalation, with attached evidence and a 7-day response window, typically converts within five working days. Carbon-copying customer relations preserves a paper trail without prematurely involving the regulator.
              </p>
              <div className="recommend-meta">
                <div className="item">
                  <div className="k">Expected reply</div>
                  <div className="v">5<em>–</em>7 business days</div>
                </div>
                <div className="item">
                  <div className="k">Likelihood</div>
                  <div className="v"><em>Strong</em> — cohort data</div>
                </div>
                <div className="item">
                  <div className="k">Fallback</div>
                  <div className="v">DGCA &amp; consumer commission</div>
                </div>
              </div>
            </div>
          </div>

          {/* § III — DRAFT */}
          <div>
            <div className="sec-head">
              <div className="num">§ III</div>
              <div className="lbl">
                <div className="title">Escalation draft</div>
                <div className="meta">Tone · {drafts[draftVariant].label} · {drafts[draftVariant].body.split(' ').length} words</div>
              </div>
            </div>

            <div className="draft">
              <div className="draft-head">
                <span className="label">Draft / Tone · {drafts[draftVariant].label}</span>
                <div className="actions">
                  <button className={"icon-btn" + (copied ? ' copied' : '')} onClick={handleCopy}>
                    {copied ? '✓ Copied' : '⎘ Copy'}
                  </button>
                  <button className="icon-btn" onClick={handleRegen}>
                    ↻ Regenerate
                  </button>
                </div>
              </div>
              <div className="draft-body" style={{opacity: regenerating ? 0.4 : 1, transition:'opacity .3s'}}>
                {drafts[draftVariant].body}
              </div>
              <div className="draft-foot">
                <span>Tuned by cohort outcomes · response rate +3.1×</span>
                <div className="actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setDraftVariant(d => (d+1) % drafts.length)}>
                    Switch tone
                  </button>
                  <button className="btn btn-accent btn-sm" onClick={() => setRoute('action')}>
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
