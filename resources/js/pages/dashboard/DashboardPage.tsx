import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users, AlertCircle, Store, TrendingUp,
    ShoppingBag, ArrowRight, ReceiptText,
} from 'lucide-react'
import api from '@/lib/axios'
import { formatMoney, toTitleCase } from '@/lib/utils'
import CountUp from '@/components/CountUp'

interface SaleGroup   { cpf: string; nome: string; total: number; quantidade: number }
interface FilialSales { codfilial: number; filial: string; total: number; quantidade: number }

function todayBR() {
    const d = new Date()
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
function firstOfMonthBR() {
    const d = new Date()
    return `01/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
function mesAtualLabel() {
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    const d = new Date()
    return `${meses[d.getMonth()]} ${d.getFullYear()}`
}

const corners = [
    'top-0 left-0 border-t-2 border-l-2',
    'top-0 right-0 border-t-2 border-r-2',
    'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-0 right-0 border-b-2 border-r-2',
]

export default function DashboardPage() {
    const navigate = useNavigate()

    const [partners,    setPartners]    = useState(0)
    const [errors,      setErrors]      = useState(0)
    const [filiais,     setFiliais]     = useState<FilialSales[]>([])
    const [mes,         setMes]         = useState<SaleGroup[]>([])
    const [loadingMes,  setLoadingMes]  = useState(true)
    const [loading,     setLoading]     = useState(true)

    useEffect(() => {
        Promise.all([
            api.get('/partners?page=1'),
            api.get('/partner-errors?page=1'),
            api.get('/sales/period/filiais', {
                params: { start_date: firstOfMonthBR(), end_date: todayBR() },
            }),
        ]).then(([p, e, f]) => {
            setPartners(p.data.total ?? 0)
            setErrors(e.data.total   ?? 0)
            setFiliais(f.data        ?? [])
        }).finally(() => setLoading(false))

        api.get('/sales/period', {
            params: { start_date: firstOfMonthBR(), end_date: todayBR() },
        }).then(r => setMes(r.data ?? []))
          .catch(() => {})
          .finally(() => setLoadingMes(false))
    }, [])

    const totalMes    = mes.reduce((s, r) => s + Number(r.total), 0)
    const qtdCompras  = mes.reduce((s, r) => s + r.quantidade, 0)
    const maxMes      = mes[0]?.total ?? 1
    const top5        = mes.slice(0, 5)

    const kpis = [
        {
            label: 'Funcionários',
            sub:   'cadastrados',
            value: partners,
            decimals: 0,
            icon:  Users,
            color: 'primary' as const,
            to:    '/funcionarios',
        },
        {
            label: 'Gasto no Mês',
            sub:   mesAtualLabel(),
            value: totalMes,
            decimals: 2,
            icon:  TrendingUp,
            color: 'primary' as const,
            highlight: true,
            to:    '/compras/periodo',
        },
        {
            label: 'Compras no Mês',
            sub:   `por ${mes.length} funcionários`,
            value: qtdCompras,
            decimals: 0,
            icon:  ShoppingBag,
            color: 'primary' as const,
            to:    '/compras/periodo',
        },
        {
            label: 'Erros Pendentes',
            sub:   'aguardam revisão',
            value: errors,
            decimals: 0,
            icon:  AlertCircle,
            color: errors > 0 ? 'amber' as const : 'primary' as const,
            to:    '/importar/erros',
        },
    ]

    return (
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">

            {/* ── Título ── */}
            <div>
                <p className="text-[0.5rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Sistema de Convênio</p>
                <h1 className="text-xl font-black uppercase tracking-[0.08em] text-(--foreground)">Dashboard</h1>
            </div>

            {/* ── KPIs ── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">
                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 6%, transparent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {corners.map((cls, i) => (
                    <div key={i} className={`absolute z-10 w-5 h-5 border-(--primary)/30 ${cls}`} />
                ))}

                <div className="relative grid grid-cols-2 md:grid-cols-4 divide-(--border) [&>*]:border-r [&>*:nth-child(2n)]:border-r-0 md:[&>*]:border-r md:[&>*:nth-child(2n)]:border-r md:[&>*:nth-child(4n)]:border-r-0 [&>*:nth-child(n+3)]:border-t md:[&>*:nth-child(n+3)]:border-t-0">
                    {kpis.map(({ label, sub, value, decimals, icon: Icon, color, highlight, to }) => (
                        <button
                            key={label}
                            onClick={() => navigate(to)}
                            className={`group relative text-left px-4 md:px-7 py-5 border-r border-b border-(--border) overflow-hidden transition-all duration-200 ${highlight ? 'bg-(--primary)/5 hover:bg-(--primary)/10' : 'bg-transparent hover:bg-muted'}`}
                        >
                            <div className={`absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-200 ${highlight ? 'opacity-100 bg-(--primary)' : 'opacity-0 group-hover:opacity-50 bg-(--primary)'}`} />

                            <div className="flex items-center gap-1.5 mb-2.5">
                                <Icon size={9} className={`transition-colors ${color === 'amber' ? 'text-amber-500' : highlight ? 'text-(--primary)' : 'text-(--muted-foreground) group-hover:text-(--primary)'}`} />
                                <p className="text-[0.44rem] uppercase tracking-[0.22em] text-(--muted-foreground)">{label}</p>
                            </div>

                            <p className={`font-black tabular-nums leading-none transition-colors ${highlight ? 'text-2xl text-(--primary)' : `text-xl ${color === 'amber' && value > 0 ? 'text-amber-500' : 'text-(--foreground) group-hover:text-(--primary)'}`}`}>
                                {decimals > 0 && <span className="text-[0.45em] font-bold opacity-50 mr-0.5">R$</span>}
                                {loading || (label === 'Gasto no Mês' && loadingMes) || (label === 'Compras no Mês' && loadingMes)
                                    ? <span className="opacity-30">—</span>
                                    : <CountUp value={value} decimals={decimals} duration={2.8} />
                                }
                            </p>

                            <p className="text-[0.43rem] text-(--muted-foreground) mt-2 uppercase tracking-[0.15em]">{sub}</p>

                            <ArrowRight size={10} className="absolute bottom-4 right-4 text-(--muted-foreground) opacity-0 group-hover:opacity-40 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Grid: ranking + info ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Ranking do mês — 2/3 */}
                <div className="lg:col-span-2 bg-card border border-(--border) flex flex-col">
                    <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center justify-between">
                        <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                            Maiores Compradores — {mesAtualLabel()}
                        </span>
                        <button
                            onClick={() => navigate('/compras/periodo')}
                            className="flex items-center gap-1 text-[0.48rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--primary) transition-colors"
                        >
                            Ver tudo <ArrowRight size={9} />
                        </button>
                    </div>

                    <div className="flex-1 p-5 flex flex-col gap-3">
                        {loadingMes ? (
                            <div className="flex-1 flex items-center justify-center py-8">
                                <span className="text-[0.72rem] text-(--muted-foreground)">Carregando…</span>
                            </div>
                        ) : top5.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
                                <ShoppingBag size={24} className="text-(--muted-foreground) opacity-20" />
                                <p className="text-[0.72rem] text-(--muted-foreground)">Sem compras registradas neste mês.</p>
                            </div>
                        ) : top5.map((r, i) => {
                            const barW = maxMes > 0 ? (Number(r.total) / maxMes) * 100 : 0
                            return (
                                <div key={r.cpf} className="group flex flex-col gap-1.5 cursor-default">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[0.5rem] font-black tabular-nums shrink-0 w-5 ${i < 3 ? 'text-(--primary)' : 'text-(--muted-foreground) opacity-40'}`}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="flex-1 text-[0.75rem] font-semibold text-(--foreground) truncate group-hover:text-(--primary) transition-colors">
                                            {toTitleCase(r.nome)}
                                        </span>
                                        <span className="text-[0.72rem] font-black text-(--primary) tabular-nums shrink-0">
                                            {formatMoney(r.total)}
                                        </span>
                                        <span className="text-[0.48rem] text-(--muted-foreground) shrink-0 w-8 text-right tabular-nums">
                                            {r.quantidade}x
                                        </span>
                                    </div>
                                    <div className="h-0.5 bg-(--border) w-full overflow-hidden ml-8">
                                        <div
                                            className="h-full bg-(--primary) opacity-50 group-hover:opacity-90 transition-all duration-500"
                                            style={{ width: `${barW}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Painel lateral — 1/3 */}
                <div className="flex flex-col gap-4">

                    {/* Lojas */}
                    <div className="bg-card border border-(--border) flex-1">
                        <div className="px-5 py-3.5 border-b border-(--border) bg-muted flex items-center justify-between">
                            <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                Lojas — {mesAtualLabel()}
                            </span>
                            <Store size={10} className="text-(--muted-foreground) opacity-50" />
                        </div>

                        <div className="p-4 flex flex-col gap-3">
                            {loading ? (
                                <p className="text-[0.72rem] text-(--muted-foreground)">Carregando…</p>
                            ) : filiais.length === 0 ? (
                                <p className="text-[0.72rem] text-(--muted-foreground) text-center py-3">Sem compras no mês.</p>
                            ) : filiais.map((f, i) => {
                                const maxF = filiais[0]?.total ?? 1
                                const barW = (Number(f.total) / maxF) * 100
                                return (
                                    <div key={f.codfilial} className="group flex flex-col gap-1 cursor-default">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[0.48rem] font-black tabular-nums shrink-0 w-4 ${i < 3 ? 'text-(--primary)' : 'text-(--muted-foreground) opacity-40'}`}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="flex-1 text-[0.68rem] font-semibold text-(--foreground) truncate group-hover:text-(--primary) transition-colors">
                                                {f.filial}
                                            </span>
                                            <span className="text-[0.65rem] font-black text-(--primary) tabular-nums shrink-0">
                                                {formatMoney(f.total)}
                                            </span>
                                        </div>
                                        <div className="h-0.5 bg-(--border) w-full overflow-hidden ml-6">
                                            <div
                                                className="h-full bg-(--primary) opacity-50 group-hover:opacity-90 transition-all duration-500"
                                                style={{ width: `${barW}%` }}
                                            />
                                        </div>
                                        <p className="text-[0.43rem] uppercase tracking-[0.12em] text-(--muted-foreground) ml-6">
                                            {f.quantidade} compra{f.quantidade !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="px-4 py-2.5 border-t border-(--border) bg-muted">
                            <p className="text-[0.44rem] uppercase tracking-[0.2em] text-(--muted-foreground)">
                                {filiais.length} loja{filiais.length !== 1 ? 's' : ''} com movimento no mês
                            </p>
                        </div>
                    </div>

                    {/* Atalhos */}
                    <div className="bg-card border border-(--border)">
                        <div className="px-5 py-3.5 border-b border-(--border) bg-muted">
                            <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Acesso Rápido</span>
                        </div>
                        <div className="flex flex-col divide-y divide-(--border)">
                            {[
                                { label: 'Cadastrar Funcionário', to: '/funcionarios/cadastrar', icon: Users   },
                                { label: 'Importar CSV',          to: '/importar/csv',           icon: ReceiptText },
                                { label: 'Extrato por Período',   to: '/compras/periodo',        icon: TrendingUp  },
                            ].map(({ label, to, icon: Icon }) => (
                                <button
                                    key={to}
                                    onClick={() => navigate(to)}
                                    className="group flex items-center justify-between px-5 py-3 hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon size={11} className="text-(--muted-foreground) group-hover:text-(--primary) transition-colors" />
                                        <span className="text-[0.65rem] font-semibold text-(--foreground) group-hover:text-(--primary) transition-colors">{label}</span>
                                    </div>
                                    <ArrowRight size={10} className="text-(--muted-foreground) opacity-0 group-hover:opacity-60 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
