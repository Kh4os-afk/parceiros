import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/layouts/AppSidebar'

type Crumb = { label: string; href?: string }

function useBreadcrumbs(): Crumb[] {
    const { pathname } = useLocation()

    const dash: Crumb  = { label: 'Dashboard',            href: '/dashboard'      }
    const func: Crumb  = { label: 'Funcionários',          href: '/funcionarios'   }
    const erros: Crumb = { label: 'Erros de Importação',   href: '/importar/erros' }

    if (pathname === '/dashboard') return [{ label: 'Dashboard' }]

    if (pathname === '/funcionarios')             return [dash, { label: 'Funcionários' }]
    if (pathname === '/funcionarios/cadastrar')   return [dash, func, { label: 'Cadastrar' }]
    if (/^\/funcionarios\/\d+$/.test(pathname))  return [dash, func, { label: 'Detalhes' }]
    if (/^\/funcionarios\/\d+\/editar$/.test(pathname)) return [dash, func, { label: 'Editar' }]

    if (pathname === '/importar/csv')   return [dash, func, { label: 'Importar CSV' }]
    if (pathname === '/importar/erros') return [dash, func, { label: 'Erros de Importação' }]
    if (/^\/importar\/erros\/\d+\/editar$/.test(pathname)) return [dash, func, erros, { label: 'Corrigir' }]

    if (pathname === '/compras/funcionario') return [dash, { label: 'Relatórios' }, { label: 'Compras por Funcionário' }]
    if (pathname === '/compras/periodo')     return [dash, { label: 'Relatórios' }, { label: 'Extrato por Período' }]
    if (pathname === '/consulta')            return [dash, { label: 'Relatórios' }, { label: 'Consulta de Saldo' }]

    if (pathname === '/admin/empresas')  return [dash, { label: 'Administração' }, { label: 'Empresas' }]
    if (pathname === '/admin/usuarios')  return [dash, { label: 'Administração' }, { label: 'Usuários' }]

    return [dash]
}

export default function AppLayout() {
    const breadcrumbs = useBreadcrumbs()
    const navigate = useNavigate()

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />

            <SidebarInset>
                {/* ── Header sticky ── */}
                <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 sticky top-0 z-10 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mx-1 h-4" />

                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, i) => {
                                const isLast = i === breadcrumbs.length - 1
                                return (
                                    <span key={i} className="flex items-center gap-1.5">
                                        <BreadcrumbItem>
                                            {isLast ? (
                                                <BreadcrumbPage className="text-[0.68rem] font-bold uppercase tracking-widest">
                                                    {crumb.label}
                                                </BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink
                                                    onClick={crumb.href ? () => navigate(crumb.href!) : undefined}
                                                    className={`text-[0.68rem] font-medium uppercase tracking-widest text-muted-foreground transition-colors ${crumb.href ? 'hover:text-foreground cursor-pointer' : 'cursor-default'}`}
                                                >
                                                    {crumb.label}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {!isLast && <BreadcrumbSeparator />}
                                    </span>
                                )
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* ── Conteúdo da página ── */}
                <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
