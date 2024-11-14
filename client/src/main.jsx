import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux';
import store from './store';
import { ThemeProvider } from './components/theme-provider.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import AuthCheck from './components/AuthCheck.jsx';

createRoot(document.getElementById('root')).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    
    <Provider store={store}>
    
    <App />
      
    </Provider>

    </ThemeProvider>
  ,
)
