import React from 'react'
import ReactDOM from 'react-dom'
import App from './modules/app'
import './index.css'
import { GlobalStateProvider } from './context/global'

ReactDOM.render(
  <GlobalStateProvider>
    <App />
  </GlobalStateProvider>,
  document.getElementById('root'),
)
