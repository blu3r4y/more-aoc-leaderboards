import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={process.env.PUBLIC_URL + "/logo.svg"} className="App-logo" alt="logo" />
        <p>More AoC Leaderboards!</p>
      </header>
    </div>
  );
}

export default App;
