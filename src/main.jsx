import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// No need to import index.css here if imported in App.jsx, but common practice here too
// import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)