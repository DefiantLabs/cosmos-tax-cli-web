import './App.css';
import React from "react";
import Form from "./Form";

function App() {
  return (
    <React.Fragment>
      <header className="App-header">
        cosmos-tax-cli-web
      </header>
      <div className="App-content">
        <Form/>
      </div>
      <footer className="App-footer">
        © 2022 Defiant Labs. All rights reserved.
      </footer>
    </React.Fragment>
  );
}

export default App;
