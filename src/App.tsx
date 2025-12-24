import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './layouts/Main';
import { Clasification } from './layouts/Clasification';

const AppContent: React.FC = () => {
  return (
    <Main>
      <Routes>
        <Route path="/" element={<Clasification />} />
      </Routes>
    </Main>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
