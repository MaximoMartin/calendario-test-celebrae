import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ShopStateProvider } from './hooks/useShopState'
import { EntitiesStateProvider } from './hooks/useEntitiesState'
import { ReservationsProvider } from './features/reservations/mockData'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReservationsProvider>
      <EntitiesStateProvider>
        <ShopStateProvider>
          <App />
        </ShopStateProvider>
      </EntitiesStateProvider>
    </ReservationsProvider>
  </StrictMode>,
)
