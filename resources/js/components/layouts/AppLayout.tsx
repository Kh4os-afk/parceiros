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

const routeMap: Record<string, { section: string; label: string; sectionHref?: string }> = {
    '/dashboard':           { section: 'Geral',      label: 'Dashboard' },
    '/funcionarios':        { section: 'Cadastros',   label: 'Funcionários' },
    '/importar/csv':        { section: 'Importação',  label: 'Importar CSV' },
    '/importar/erros':      { section: 'Importação',  label: 'Erros de Importação' },
    '/compras/funcionario': { section: 'Relatórios',  label: 'Compras por Funcionário' },
    '/compras/periodo':     { section: 'Relatórios',  label: 'Extrato por Período' },
}

type Crumb = { label: string; href?: string }

function useBreadcrumbs(): Crumb[] {
    const { pathname } = useLocation()

    const exact = routeMap[pathname]
    if (exact) {
        return [
            { label: exact.section },
            { label: exact.label },
        ]
    }

    if (pathname.startsWith('/funcionarios/') && pathname.endsWith('/editar')) {
        return [
            { label: 'Cadastros' },
            { label: 'Funcionários', href: '/funcionarios' },
            { label: 'Editar' },
        ]
    }

    if (pathname.startsWith('/funcionarios/cadastrar')) {
        return [
            { label: 'Cadastros' },
            { label: 'Funcionários', href: '/funcionarios' },
            { label: 'Cadastrar' },
        ]
    }

    if (/^\/importar\/erros\/\d+\/editar$/.test(pathname)) {
        return [
            { label: 'Importação' },
            { label: 'Erros de Importação', href: '/importar/erros' },
            { label: 'Corrigir' },
        ]
    }

    return [{ label: 'Dashboard' }]
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
                <main className="flex flex-1 flex-col gap-4 p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
