import { useLocation, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
    LayoutDashboard, Users, Upload, AlertCircle,
    CalendarRange, LogOut, ChevronsUpDown,
    Building2, UserCog, Search, Settings,
} from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navGroups = [
    {
        label: 'Geral',
        items: [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ],
    },
    {
        label: 'Cadastros',
        items: [
            { to: '/funcionarios', icon: Users, label: 'Funcionários' },
            { to: '/importar/csv', icon: Upload, label: 'Importar CSV' },
            { to: '/importar/erros', icon: AlertCircle, label: 'Erros de Importação' },
        ],
    },
    {
        label: 'Relatórios',
        items: [
            { to: '/compras/periodo', icon: CalendarRange, label: 'Extrato por Período' },
            { to: '/consulta',        icon: Search,        label: 'Consulta de Saldo'   },
        ],
    },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
    const { pathname } = useLocation()
    const { setOpenMobile } = useSidebar()
    const isActive = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={label} isActive={isActive}>
                <NavLink to={to} end onClick={() => setOpenMobile(false)}>
                    <Icon />
                    <span>{label}</span>
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
            { to: '/admin/usuarios', icon: UserCog, label: 'Usuários' },
        ],
    }

    const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() ?? 'TI'

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            {/* ── Brand ── */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <NavLink to="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground text-[0.55rem] font-black tracking-widest shrink-0">
                                    BDC
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-[0.68rem] font-medium tracking-[0.16em] uppercase text-sidebar-foreground/50">
                                        Sistema de Convênio
                                    </span>
                                </div>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Nav ── */}
            <SidebarContent>
                {[...navGroups, ...(isAdmin ? [adminGroup] : [])].map(group => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map(item => (
                                <NavItem key={item.to} {...item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* ── User footer ── */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex size-8 shrink-0 items-center justify-center bg-sidebar-primary/10 border border-sidebar-primary/25 text-[0.6rem] font-black text-sidebar-primary">
                                        {initials}
                                    </div>
                                    <div className="grid flex-1 text-left leading-tight">
                                        <span className="truncate font-semibold text-[0.78rem]">{user?.name}</span>
                                        <span className="truncate text-[0.6rem] text-sidebar-foreground/55">
                                            {isAdmin ? 'Administrador' : (user?.empresa?.nome ?? user?.email)}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-3.5 text-sidebar-foreground/50" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-48 rounded-none"
                                side="top"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem
                                    onClick={() => navigate('/configuracoes')}
                                    className="cursor-pointer gap-2"
                                >
                                    <Settings className="size-3.5" />
                                    <span className="text-[0.72rem] font-semibold uppercase tracking-wide">Configurações</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={logout}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/8 cursor-pointer gap-2"
                                >
                                    <LogOut className="size-3.5" />
                                    <span className="text-[0.72rem] font-semibold uppercase tracking-wide">Sair</span>
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
