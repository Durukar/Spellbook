import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar, type AppView } from './components/layout/Sidebar'
import { TransactionDashboard } from './components/dashboard/TransactionDashboard'
import { CardSearchView } from './components/cards/CardSearchView'
import { StockListView } from './components/stock/StockListView'
import { ThemeProvider } from '@/components/theme-provider'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard')

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex bg-bg-base h-screen text-text-primary overflow-hidden w-full">
            <AppSidebar currentView={currentView} onNavigate={setCurrentView} />
            <main className="flex-1 w-full bg-bg-base overflow-hidden">
              {currentView === 'dashboard' && <TransactionDashboard />}
              {currentView === 'search' && <CardSearchView />}
              {currentView === 'allCards' && <StockListView />}
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
