import {
    LayoutDashboard,
    BarChart3,
    BookOpen,
    Wallet,
    Settings,
    HelpCircle,
    Moon,
    Sun,
    ChevronDown,
    Search,
    Users,
    ShoppingCart,
    ArrowLeftRight,
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
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarSeparator,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useTheme } from '@/components/theme-provider';

export type AppView = 'dashboard' | 'search' | 'allCards' | 'buyers' | 'sales' | 'trade';

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
                    <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
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

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Transacoes">
                                    <BarChart3 />
                                    <span>Transacoes</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <Collapsible defaultOpen className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger render={<SidebarMenuButton tooltip="Colecao" />}>
                                        <BookOpen />
                                        <span>Colecao</span>
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={currentView === 'allCards'}
                                                    onClick={() => onNavigate?.('allCards')}
                                                >
                                                    <span>Todas as Cartas</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton>
                                                    <span>Por Colecao</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton>
                                                    <span>Lista de Desejos</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Relatorios">
                                    <BarChart3 />
                                    <span>Relatorios</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <Collapsible defaultOpen className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger render={<SidebarMenuButton tooltip="Vendas" />}>
                                        <Wallet />
                                        <span>Vendas</span>
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={currentView === 'sales'}
                                                    onClick={() => onNavigate?.('sales')}
                                                >
                                                    <ShoppingCart size={14} />
                                                    <span>Registro de Vendas</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={currentView === 'buyers'}
                                                    onClick={() => onNavigate?.('buyers')}
                                                >
                                                    <Users size={14} />
                                                    <span>Compradores</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={currentView === 'trade'}
                                                    onClick={() => onNavigate?.('trade')}
                                                >
                                                    <ArrowLeftRight size={14} />
                                                    <span>Trade Analyzer</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Comunidade">
                                    <BookOpen />
                                    <span>Comunidade</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Suporte</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Configuracoes">
                                    <Settings />
                                    <span>Configuracoes</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Ajuda e FAQ">
                                    <HelpCircle />
                                    <span>Ajuda e FAQ</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="p-4 rounded-2xl bg-gradient-to-b from-sidebar-primary/20 to-transparent border border-sidebar-primary/20 flex items-center gap-3 relative overflow-hidden group/upgrade group-data-[collapsible=icon]:hidden">
                    <div className="absolute inset-0 bg-sidebar-primary/10 blur-xl group-hover/upgrade:bg-sidebar-primary/20 transition-colors"></div>
                    <div className="relative z-10 w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0 border border-sidebar-border">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sidebar-primary">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <div className="relative z-10 text-left">
                        <h4 className="font-bold text-sidebar-foreground text-sm">Premium</h4>
                        <p className="text-xs text-sidebar-foreground/60 mt-0.5">Desbloquear todos os recursos</p>
                    </div>
                </div>

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
