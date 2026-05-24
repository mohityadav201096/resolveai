// ResolveAI v2 — Landing (Italian editorial)
function Landing({ setRoute }) {
  const goUpload = () => { setRoute('upload'); window.scrollTo({top:0,behavior:'instant'}); };
  const goResults = () => { setRoute('results'); window.scrollTo({top:0,behavior:'instant'}); };

  return (
    <div className="fade-in">
      {/* HERO */}
      <section className="page hero">
        {/* meta strip — like a publication masthead */}
        <div className="hero-meta-strip">
          <div className="item"><span className="k">Vol.</span>I — Consumer leverage</div>
          <div className="sep"></div>
          <div className="item center"><span className="k">№</span>0001 / Air & E-comm</div>
          <div className="sep"></div>
          <div className="item" style={{textAlign:'right'}}><span className="k">Set</span>2026</div>
        </div>

        <h1 className="hero-display display">
          Companies count<br/>
          on consumers<br/>
          <em>giving up.</em>
        </h1>

        <div className="hero-bottom">
          <div>
            <p className="lede">
              Upload an airline or e-commerce dispute. ResolveAI reads it, identifies the right escalation path, and drafts a message tuned to be answered.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={goUpload}>
                Analyze my issue <span className="arrow">→</span>
              </button>
              <button className="btn btn-secondary" onClick={goResults}>
                View example
              </button>
            </div>
          </div>
          <div>
            <TransformVisual />
          </div>
        </div>
      </section>

      {/* TRUST STRIP — italic wordmarks, no logos */}
      <section className="page">
        <div className="trust-strip">
          <div className="trust-row">
            <div className="tl">Disputes resolved across</div>
            <div className="marks">
              <span>Air&nbsp;travel</span><span className="sep">/</span>
              <span>Marketplaces</span><span className="sep">/</span>
              <span>Food&nbsp;delivery</span><span className="sep">/</span>
              <span>Subscriptions</span><span className="sep">/</span>
              <span>Banking</span><span className="sep">/</span>
              <span>Hospitality</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Roman numerals */}
      <section className="page section" id="how">
        <div className="sec-head">
          <div className="num">§ I</div>
          <div className="lbl">
            <div className="title">Method</div>
            <div className="meta">Three steps, no account</div>
          </div>
        </div>

        <h2 className="h2" style={{maxWidth:'18ch', marginBottom: 64}}>
          From frustration to <em>action,</em> in three movements.
        </h2>

        <div className="steps">
          <div className="step">
            <div className="roman">I.</div>
            <h3>Upload proof</h3>
            <p>Screenshots, emails, invoices, support threads — whatever describes the case.</p>
          </div>
          <div className="step">
            <div className="roman">II.</div>
            <h3>The model reads it</h3>
            <p>Issue type, severity, and the legitimate escalation path are identified in under 20 seconds.</p>
          </div>
          <div className="step">
            <div className="roman">III.</div>
            <h3>Escalate, in writing</h3>
            <p>Receive a structured recommendation and a draft tuned by tone — Standard, Firm or Brief.</p>
          </div>
        </div>
      </section>

      {/* EXAMPLE / SPECIMEN */}
      <section className="page section" id="example" style={{paddingTop: 0}}>
        <div className="sec-head">
          <div className="num">§ II</div>
          <div className="lbl">
            <div className="title">Specimen</div>
            <div className="meta">Refund delay · airline · case 2491</div>
          </div>
        </div>

        <h2 className="h2" style={{maxWidth: '22ch', marginBottom: 48}}>
          A delayed refund, <em>made actionable.</em>
        </h2>

        <div className="specimen">
          <div className="col">
            <div className="col-label">Summary</div>
            <h4>Refund delayed beyond stated <em>timeline.</em></h4>
            <p className="summary">
              Flight cancelled by the carrier on March 4. Refund acknowledged on March 6 with a 7–10 day window. As of today, day 34, no credit has been issued. Two follow-ups received automated replies only.
            </p>
            <div className="col-label" style={{marginTop: 20}}>Recommended next step</div>
            <div style={{fontFamily:'var(--serif)', fontSize:24, lineHeight:1.1, letterSpacing:'-0.012em'}}>
              Escalate to the carrier&rsquo;s <em style={{fontStyle:'italic', color:'var(--accent)'}}>nodal officer</em> with a 7-day response window.
            </div>
          </div>
          <div className="col">
            <div className="col-label">Breakdown</div>
            <div className="leader-table">
              <div className="row"><span className="k">Issue type</span><span className="dots"></span><span className="v">Refund delay</span></div>
              <div className="row"><span className="k">Severity</span><span className="dots"></span><span className="v acc">High</span></div>
              <div className="row"><span className="k">Response risk</span><span className="dots"></span><span className="v">Likely stall</span></div>
              <div className="row"><span className="k">Expected reply</span><span className="dots"></span><span className="v">5–7 days</span></div>
              <div className="row"><span className="k">Channel</span><span className="dots"></span><span className="v">Email + DGCA cc</span></div>
              <div className="row"><span className="k">Confidence</span><span className="dots"></span><span className="v acc">92%</span></div>
            </div>
          </div>
        </div>

        <div className="privacy-row">
          <div className="item"><span className="acc">∎</span> No signup required</div>
          <div className="item"><span className="acc">∎</span> Files auto-delete</div>
          <div className="item"><span className="acc">∎</span> Under 20 seconds</div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="page cta-final">
        <div className="col-num">§ III — Begin</div>
        <h2 className="display">
          Upload<br/>
          your <em>issue.</em>
        </h2>
        <div style={{marginTop: 48, display:'flex', gap:16, flexWrap:'wrap'}}>
          <button className="btn btn-accent" onClick={goUpload} style={{height:60, padding:'0 32px'}}>
            Analyze my issue <span className="arrow">→</span>
          </button>
          <button className="btn btn-secondary" onClick={goResults} style={{height:60}}>
            View example
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="page footer">
        <div className="row">
          <div className="col">
            <span className="k">Product</span>
            <a href="#" onClick={e=>e.preventDefault()}>How it works</a>
            <a href="#" onClick={e=>e.preventDefault()}>Example</a>
            <a href="#" onClick={e=>e.preventDefault()}>Pricing</a>
          </div>
          <div className="col">
            <span className="k">Cases</span>
            <a href="#" onClick={e=>e.preventDefault()}>Airline</a>
            <a href="#" onClick={e=>e.preventDefault()}>E-commerce</a>
            <a href="#" onClick={e=>e.preventDefault()}>Subscriptions</a>
          </div>
          <div className="col">
            <span className="k">Trust</span>
            <a href="#" onClick={e=>e.preventDefault()}>Privacy</a>
            <a href="#" onClick={e=>e.preventDefault()}>Terms</a>
            <a href="#" onClick={e=>e.preventDefault()}>Security</a>
          </div>
          <div className="col">
            <span className="k">Contact</span>
            <a href="#" onClick={e=>e.preventDefault()}>hello@resolve.ai</a>
            <a href="#" onClick={e=>e.preventDefault()}>Press</a>
          </div>
        </div>
        <div className="colophon">
          <div>© 26 — ResolveAI — Set in Bodoni Moda &amp; Geist</div>
          <div>Built for the consumer · No account · Files auto-delete</div>
        </div>
      </footer>
    </div>
  );
}

// Transformation visual — vertical stack, document → analysis
function TransformVisual() {
  return (
    <div className="transform slide-up">
      <div className="transform-label">
        <span>Document</span><span className="num">01 / 02</span>
      </div>
      <div className="email-card">
        <div className="from">support@aircarrier.example</div>
        <div className="subject">Re: Re: Re: Refund status — PNR 4HQ8X2</div>
        <div className="body">
          <p>Dear valued customer,</p>
          <p>
            We acknowledge receipt of your refund request. Please be informed that your case is <span className="hl">under processing</span> and the standard timeline is 7–10 working days.
          </p>
          <p>We appreciate your patience.</p>
        </div>
        <div className="tag">— ticket 88312 · day 34 of 10</div>
      </div>

      <div className="transform-arrow-row">
        <span>Reading</span>
        <span className="line"></span>
        <span>→</span>
      </div>

      <div className="transform-label">
        <span>Analysis</span><span className="num">02 / 02</span>
      </div>
      <div className="analysis-card">
        <div className="head">
          <div className="title">Refund delay · airline</div>
          <div className="sev">High</div>
        </div>
        <div className="row"><span className="k">Days overdue</span><span className="leader"></span><span className="v">24</span></div>
        <div className="row"><span className="k">Risk</span><span className="leader"></span><span className="v">Likely stall</span></div>
        <div className="row"><span className="k">Path</span><span className="leader"></span><span className="v acc">Nodal officer</span></div>
        <div className="row"><span className="k">Confidence</span><span className="leader"></span><span className="v acc">92%</span></div>
      </div>
    </div>
  );
}

window.Landing = Landing;
