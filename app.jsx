// ResolveAI — App shell + router
function App() {
  const [route, setRoute] = React.useState('landing');

  // Scroll to top on route change
  const navigate = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const renderRoute = () => {
    switch (route) {
      case 'landing':         return <Landing setRoute={navigate} />;
      case 'upload':          return <Upload setRoute={navigate} />;
      case 'processing':      return <Processing setRoute={navigate} />;
      case 'results':         return <Results setRoute={navigate} />;
      case 'action':          return <ActionPage setRoute={navigate} />;
      case 'feedback':        return <Feedback setRoute={navigate} />;
      case 'response-analyzer': return <ResponseAnalyzer setRoute={navigate} />;
      default:                return <Landing setRoute={navigate} />;
    }
  };

  return (
    <>
      <Nav setRoute={navigate} route={route} />
      <main>{renderRoute()}</main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
