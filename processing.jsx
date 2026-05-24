// ResolveAI v2 — Processing
function Processing({ setRoute }) {
  const steps = [
    'Reading your document',
    'Understanding the dispute',
    'Identifying escalation paths',
    'Preparing recommendations',
  ];
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < steps.length) {
        setActive(i);
        setTimeout(tick, 1400);
      } else {
        setTimeout(() => {
          setRoute('results');
          window.scrollTo({top:0,behavior:'instant'});
        }, 1100);
      }
    };
    const t = setTimeout(tick, 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="processing fade-in">
      <div className="page processing-card">
        <div className="processing-head">
          <span><span style={{color:'var(--mute)'}}>State —</span> <span className="acc">in progress</span></span>
          <span style={{color:'var(--mute)'}}>Est. 14 sec</span>
        </div>

        <div key={active} className="processing-msg fade-in">
          {steps[active]}
        </div>

        <div className="processing-steps">
          {steps.map((s, i) => (
            <div key={s} className={"processing-step " + (i < active ? 'done' : i === active ? 'active' : '')}>
              <span className="idx">{String(i+1).padStart(2,'0')}</span>
              <span>{s}</span>
              <span className="status">
                {i < active ? '— done' : i === active ? '— ' : '— queued'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.Processing = Processing;
