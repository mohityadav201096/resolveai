// ResolveAI — App shell + page router
function App() {
  const [route, setRoute] = React.useState('landing');

  // Sticky mobile CTA only on landing
  React.useEffect(() => {
    document.body.classList.toggle('with-sticky', route === 'landing');
  }, [route]);

  const { Nav, Landing, Upload, Processing, Results, ActionPage, Feedback, Icon } = window;

  const screenLabel = {
    landing: '01 Landing',
    upload: '02 Upload',
    processing: '03 Processing',
    results: '04 Analysis Results',
    action: '05 Action',
    feedback: '06 Feedback',
  }[route];

  return (
    <div data-screen-label={screenLabel}>
      <Nav route={route} setRoute={setRoute} />

      {route === 'landing' && <Landing setRoute={setRoute} />}
      {route === 'upload' && <Upload setRoute={setRoute} />}
      {route === 'processing' && <Processing setRoute={setRoute} />}
      {route === 'results' && <Results setRoute={setRoute} />}
      {route === 'action' && <ActionPage setRoute={setRoute} />}
      {route === 'feedback' && <Feedback setRoute={setRoute} />}

      {/* Sticky mobile CTA only on landing */}
      {route === 'landing' && (
        <div className="sticky-cta show">
          <button className="btn btn-primary" onClick={() => { setRoute('upload'); window.scrollTo({top:0,behavior:'instant'}); }}>
            Analyze my issue <Icon.ArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
