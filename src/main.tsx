import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ShopStateProvider } from './hooks/useShopState'
import { EntitiesStateProvider } from './hooks/useEntitiesState'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EntitiesStateProvider>
      <ShopStateProvider>
        <App />
      </ShopStateProvider>
    </EntitiesStateProvider>
  </StrictMode>,
)
