/* This is the entry point for the application.*/
/* Responsible for rendering the application to the DOM (Document Object Model). */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/*" element={ <App /> }>
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

serviceWorker.unregister();


