import {
    LayoutDashboard,
    Moon,
    Sun,
    Search,
    Users,
    ShoppingCart,
    ArrowLeftRight,
    Package,
    Layers,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { useTheme } from '@/components/theme-provider';

export type AppView = 'dashboard' | 'search' | 'allCards' | 'collectionBySet' | 'buyers' | 'sales' | 'trade';

interface AppSidebarProps {
    currentView?: AppView;
    onNavigate?: (view: AppView) => void;
}

export function AppSidebar({ currentView = 'dashboard', onNavigate }: AppSidebarProps) {
    const { theme, setTheme } = useTheme();

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border select-none">
            <SidebarHeader className="p-0">
                <div className="h-14 flex items-center justify-between px-4 shrink-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 group-data-[collapsible=icon]:hidden">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sidebar-primary" />
                                <path d="M12 6l1.5 3 3.5 1.5-3.5 1.5L12 15l-1.5-3L7 10.5l3.5-1.5L12 6z" fill="currentColor" className="text-sidebar-primary" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                            SpellBook
                        </span>
                    </div>
                    <SidebarTrigger className="text-sidebar-foreground/60 hover:text-sidebar-foreground" />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Geral</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={currentView === 'dashboard'}
                                    tooltip="Dashboard"
                                    onClick={() => onNavigate?.('dashboard')}
                                >
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={currentView === 'search'}
                                    tooltip="Buscar Cartas"
                                    onClick={() => onNavigate?.('search')}
                                >
                                    <Search />
                                    <span>Buscar Cartas</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Estoque</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={currentView === 'allCards'}
                                    tooltip="Todas as Cartas"
                                    onClick={() => onNavigate?.('allCards')}
                                >
                                    <Package />
                                    <span>Todas as Cartas</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={currentView === 'collectionBySet'}
                                    tooltip="Por Colecao"
                                    onClick={() => onNavigate?.('collectionBySet')}
                                >
                                    <Layers />
                                    <span>Por Colecao</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Comercial</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={currentView === 'sales'}
                                    tooltip="Registro de Vendas"
                                    onClick={() => onNavigate?.('sales')}
                                >
                                    <ShoppingCart />
                                    <span>Registro de Vendas</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={currentView === 'buyers'}
                                    tooltip="Compradores"
                                    onClick={() => onNavigate?.('buyers')}
                                >
                                    <Users />
                                    <span>Compradores</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={currentView === 'trade'}
                                    tooltip="Trade Analyzer"
                                    onClick={() => onNavigate?.('trade')}
                                >
                                    <ArrowLeftRight />
                                    <span>Trade Analyzer</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            {theme === 'dark' ? <Sun /> : <Moon />}
                            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
