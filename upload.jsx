// ResolveAI v2 — Upload page
function Upload({ setRoute }) {
  const [dragging, setDragging] = React.useState(false);
  const [activeChip, setActiveChip] = React.useState(null);
  const inputRef = React.useRef(null);

  const chips = ['Refund delayed', 'Flight cancelled', 'Wrong product', 'Return rejected', 'No support response'];

  const startAnalysis = (name) => {
    setTimeout(() => {
      setRoute('processing');
      window.scrollTo({top:0,behavior:'instant'});
    }, 240);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    startAnalysis(f ? f.name : 'booking_email.pdf');
  };
  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (f) startAnalysis(f.name);
  };
  const useSample = () => startAnalysis('airline_refund_pnr-4HQ8X2.pdf');

  return (
    <div className="fade-in">
      <section className="page upload-shell">
        <div className="sec-head">
          <div className="num">§ I</div>
          <div className="lbl">
            <div className="title">Upload</div>
            <div className="meta">JPG · PNG · PDF · up to 20 MB</div>
          </div>
        </div>

        <h1 className="h1" style={{maxWidth: '20ch', marginBottom: 24}}>
          Let&rsquo;s see what <em>you&rsquo;re dealing with.</em>
        </h1>
        <p className="lede" style={{marginBottom: 24}}>
          Drop a screenshot, invoice, refund email, or full support thread. The file stays only as long as the analysis takes.
        </p>

        <div className="upload-grid">
          <div>
            <div
              className={"dropzone" + (dragging ? " is-dragging" : "")}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <div className="stack-icon">
                <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
                  <rect x="10" y="6" width="22" height="30" transform="rotate(-6 10 6)" opacity="0.3"/>
                  <rect x="14" y="10" width="22" height="30" transform="rotate(3 14 10)" opacity="0.6"/>
                  <rect x="14" y="12" width="22" height="30"/>
                  <path d="M19 22h12M19 27h12M19 32h7"/>
                </svg>
              </div>
              <h3>Drop your <em>file</em> here.</h3>
              <p>Screenshot, invoice, refund email, or support conversation.</p>
              <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                Choose a file <span className="arrow">→</span>
              </button>
              <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{display:'none'}} onChange={onPick} />
              <div className="formats">JPG · PNG · PDF · 20 MB max</div>
            </div>

            <div style={{marginTop: 36}}>
              <div className="eyebrow" style={{marginBottom: 16}}>Or — describe in one tap</div>
              <div className="chips">
                {chips.map((c) => (
                  <button
                    key={c}
                    className={"chip" + (activeChip === c ? " is-active" : "")}
                    onClick={() => setActiveChip(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sample preview side */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', paddingBottom: 14, borderBottom:'1px solid var(--ink)', marginBottom: 24, fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.14em', textTransform:'uppercase'}}>
              <span>Sample · live</span>
              <span style={{color:'var(--mute)'}}>fig. 01</span>
            </div>
            <h4 style={{fontFamily:'var(--serif)', fontSize:28, fontWeight:400, lineHeight:1.05, letterSpacing:'-0.012em', margin:'0 0 12px 0'}}>
              What the <em style={{fontStyle:'italic', color:'var(--accent)'}}>analysis</em> looks like.
            </h4>
            <p style={{color:'var(--ink-2)', fontSize:14, lineHeight:1.55, margin:'0 0 24px 0', maxWidth:'42ch'}}>
              No file handy? Walk through the same flow on a realistic airline refund case.
            </p>

            <div className="analysis-card" style={{marginBottom: 20}}>
              <div className="head">
                <div className="title">Refund delay · airline</div>
                <div className="sev">High</div>
              </div>
              <div className="row"><span className="k">Issue</span><span className="leader"></span><span className="v">Refund delay</span></div>
              <div className="row"><span className="k">Days overdue</span><span className="leader"></span><span className="v">24</span></div>
              <div className="row"><span className="k">Path</span><span className="leader"></span><span className="v acc">Nodal officer</span></div>
              <div className="row"><span className="k">Confidence</span><span className="leader"></span><span className="v acc">92%</span></div>
            </div>

            <button className="btn btn-secondary btn-sm" style={{width:'100%'}} onClick={useSample}>
              Use this sample <span className="arrow">→</span>
            </button>

            <p style={{marginTop: 32, fontFamily:'var(--mono)', fontSize: 10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--mute)', lineHeight:1.7}}>
              ∎ End-to-end encrypted<br/>
              ∎ Auto-deleted within one hour<br/>
              ∎ No account required
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

window.Upload = Upload;
