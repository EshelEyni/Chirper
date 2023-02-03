import React from 'react'
import ReactDOM from 'react-dom/client'
import RootComponent from './root-component'
import { BrowserRouter as Router } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <RootComponent />
    </Router>
  </React.StrictMode>,
)
