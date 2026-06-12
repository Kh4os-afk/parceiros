import { useLocation, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
    LayoutDashboard, Users, Upload, AlertCircle,
    CalendarRange, LogOut, ChevronsUpDown,
    Building2, UserCog, Search, Settings, ShoppingCart, Gift,
} from 'lucide-react'
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
    SidebarHeader, SidebarMenu, SidebarMenuButton,
    SidebarMenuItem, SidebarRail, useSidebar,
} from '@/components/ui/sidebar'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Design tokens — sincronizados com o design system V2
const CYAN   = '#0099cc'
const BORDER = '#e8eaef'

const navGroups = [
    {
        label: 'Geral',
        items: [
            { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard'          },
        ],
    },
    {
        label: 'Cadastros',
        items: [
            { to: '/funcionarios',   icon: Users,       label: 'Funcionários'        },
            { to: '/importar/csv',   icon: Upload,      label: 'Importar CSV'        },
            { to: '/importar/erros', icon: AlertCircle, label: 'Erros de Importação' },
        ],
    },
    {
        label: 'Relatórios',
        items: [
            { to: '/compras/periodo', icon: CalendarRange, label: 'Extrato por Período' },
            { to: '/consulta',        icon: Search,        label: 'Consulta de Saldo'   },
            { to: '/gift-cards',      icon: Gift,          label: 'Consultar Gift Card' },
        ],
    },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
    const { pathname }    = useLocation()
    const { setOpenMobile } = useSidebar()
    const isActive = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={label} isActive={isActive}
                className={[
                    'relative h-8 rounded-none transition-all duration-150',
                    isActive
                        ? 'bg-[#0099cc08] text-[#0099cc] font-bold'
                        : 'text-[#64748b] hover:bg-[#f4f5f8] hover:text-[#334155] font-medium',
                ].join(' ')}
            >
                <NavLink to={to} end onClick={() => setOpenMobile(false)} className="flex items-center gap-2.5 px-2">
                    {/* Indicador lateral ativo */}
                    <span
                        className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r transition-all duration-200"
                        style={{ background: isActive ? CYAN : 'transparent' }}
                    />
                    <Icon size={14} />
                    <span className="text-[0.7rem] tracking-[0.04em]">{label}</span>
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()

    const adminGroup = {
        label: 'Administração',
        items: [
            { to: '/admin/empresas', icon: Building2, label: 'Empresas' },
            { to: '/admin/usuarios', icon: UserCog,   label: 'Usuários' },
        ],
    }

    const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() ?? '—'

    return (
        <Sidebar collapsible="offcanvas" {...props}
            className="border-r-0"
            style={{ '--sidebar': '#ffffff', '--sidebar-border': BORDER } as React.CSSProperties}
        >
            {/* ── Brand ─────────────────────────────────────────────── */}
            <SidebarHeader className="px-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <NavLink to="/dashboard" className="flex items-center gap-3 group">
                    {/* Logo mark */}
                    <div
                        className="w-8 h-8 shrink-0 flex items-center justify-center"
                        style={{ background: `${CYAN}12`, border: `1px solid ${CYAN}30` }}
                    >
                        <ShoppingCart size={14} style={{ color: CYAN }} />
                    </div>
                    {/* Brand text */}
                    <div className="flex flex-col leading-none min-w-0">
                        <span className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-muted-foreground mb-0.5">
                            Sistema de Convênio
                        </span>
                        <span className="text-[0.75rem] font-black uppercase tracking-[0.08em] text-foreground truncate">
                            Baratão da Carne
                        </span>
                    </div>
                </NavLink>
            </SidebarHeader>

            {/* ── Nav ───────────────────────────────────────────────── */}
            <SidebarContent className="px-2 py-3 gap-0">
                {[...navGroups, ...(isAdmin ? [adminGroup] : [])].map((group, gi) => (
                    <SidebarGroup key={group.label} className={gi > 0 ? 'mt-4' : ''}>
                        {/* Group label */}
                        <div className="px-2 mb-1">
                            <span className="text-[0.52rem] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                                {group.label}
                            </span>
                        </div>
                        <SidebarMenu className="gap-0.5">
                            {group.items.map(item => (
                                <NavItem key={item.to} {...item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* ── User footer ───────────────────────────────────────── */}
            <SidebarFooter className="px-3 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="rounded-none h-auto py-2 px-2 hover:bg-[#f4f5f8] transition-colors"
                                >
                                    {/* Avatar */}
                                    <div
                                        className="flex size-8 shrink-0 items-center justify-center text-[0.58rem] font-black"
                                        style={{
                                            background: `${CYAN}10`,
                                            border: `1.5px solid ${CYAN}25`,
                                            color: CYAN,
                                        }}
                                    >
                                        {initials}
                                    </div>
                                    {/* Info */}
                                    <div className="grid flex-1 text-left leading-tight min-w-0">
                                        <span className="truncate text-[0.7rem] font-semibold text-foreground">
                                            {user?.name}
                                        </span>
                                        <span className="truncate text-[0.58rem] text-muted-foreground">
                                            {isAdmin ? 'Administrador' : (user?.empresa?.nome ?? user?.email)}
                                        </span>
                                    </div>
                                    <ChevronsUpDown size={13} className="ml-auto text-muted-foreground/50 shrink-0" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-48 rounded-none bg-white p-1 shadow-lg"
                                style={{ border: `1px solid ${BORDER}` }}
                                side="top"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem
                                    onClick={() => navigate('/configuracoes')}
                                    className="rounded-none cursor-pointer gap-2.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground focus:text-foreground hover:bg-[#f4f5f8] focus:bg-[#f4f5f8]"
                                >
                                    <Settings size={13} />
                                    Configurações
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={logout}
                                    className="rounded-none cursor-pointer gap-2.5 text-[0.68rem] font-semibold uppercase tracking-wider text-red-500 hover:text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50"
                                >
                                    <LogOut size={13} />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
