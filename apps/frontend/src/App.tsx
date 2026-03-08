import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from './components/layout/Sidebar'
import { TransactionDashboard } from './components/dashboard/TransactionDashboard'

import { ThemeProvider } from '@/components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex bg-bg-base h-screen text-text-primary overflow-hidden w-full">
            <AppSidebar />
            <main className="flex-1 w-full bg-bg-base overflow-hidden">
              <TransactionDashboard />
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
