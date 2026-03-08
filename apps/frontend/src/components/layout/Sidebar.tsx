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

export type AppView = 'dashboard' | 'search';

interface AppSidebarProps {
    currentView?: AppView;
    onNavigate?: (view: AppView) => void;
}

export function AppSidebar({ currentView = 'dashboard', onNavigate }: AppSidebarProps) {
    const { theme, setTheme } = useTheme();

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="p-0">
                {/* Logo + Collapse Toggle */}
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
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
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
                                <SidebarMenuButton tooltip="Transactions">
                                    <BarChart3 />
                                    <span>Transactions</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Portfolio with collapsible submenu */}
                            <Collapsible defaultOpen className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger render={<SidebarMenuButton tooltip="Portfolio" />}>
                                        <BookOpen />
                                        <span>Portfolio</span>
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton isActive>
                                                    <span>All Cards</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton>
                                                    <span>By Set</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton>
                                                    <span>Wishlist</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Analytics">
                                    <BarChart3 />
                                    <span>Analytics</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Wallet">
                                    <Wallet />
                                    <span>Wallet</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Community">
                                    <BookOpen />
                                    <span>Community</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Support */}
                <SidebarGroup>
                    <SidebarGroupLabel>Support</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Settings">
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Help & FAQ">
                                    <HelpCircle />
                                    <span>Help & FAQ</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                {/* Upgrade Card */}
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
                        <h4 className="font-bold text-sidebar-foreground text-sm">Upgrade</h4>
                        <p className="text-xs text-sidebar-foreground/60 mt-0.5">Unlock all features</p>
                    </div>
                </div>

                {/* Dark Mode Toggle */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            {theme === 'dark' ? <Sun /> : <Moon />}
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
