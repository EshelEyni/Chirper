import React from 'react'
import ReactDOM from 'react-dom/client'
import RootComponent from './root-component'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>,
)
