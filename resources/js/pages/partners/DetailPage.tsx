import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Pencil, ShoppingBag, TrendingUp, TrendingDown,
    CreditCard, Ban, ExternalLink, Store,
} from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, formatMoney, toTitleCase } from '@/lib/utils'
import { CountingNumber } from '@/components/animate-ui/primitives/texts/counting-number'

interface Partner {
    id: number
    nome: string
    cpf: string
    matricula: string | null
    limcred: number
    bloqueado: number
    empresa?: { nome: string }
}

interface Sale {
    id: number
    numnota: string
    dtsaida: string
    vltotal: number
    codfilial: number
    qrcodenfce: string | null
    dtcancel: string | null
    dtdevol: string | null
    filial?: { filial: string }
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatDate(iso: string) {
    const [, m, d] = iso.split('-')
    return `${d}/${m}`
}

function formatDateFull(iso: string) {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

function compactMoney(v: number) {
    if (v === 0) return '—'
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(1).replace('.', ',')}k`
    return `R$ ${Math.round(v)}`
}


export default function PartnerDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [partner, setPartner] = useState<Partner | null>(null)
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [salesPage, setSalesPage] = useState(1)

    const PER_PAGE = 10

    useEffect(() => {
        setLoading(true)
        Promise.all([
            api.get(`/partners/${id}`),
            api.get(`/partners/${id}/sales`),
        ]).then(([p, s]) => {
            setPartner(p.data)
            setSales(s.data)
            setSalesPage(1)
        }).finally(() => setLoading(false))
    }, [id])

    // ── Derived metrics ──────────────────────────────────────────────────────
    const activeSales   = useMemo(() => sales.filter(s => !s.dtcancel), [sales])
    const canceledSales = useMemo(() => sales.filter(s => !!s.dtcancel), [sales])
    const totalGasto    = useMemo(() => activeSales.reduce((s, c) => s + Number(c.vltotal), 0), [activeSales])
    const avgTicket     = activeSales.length > 0 ? totalGasto / activeSales.length : 0
    const pct           = partner && partner.limcred > 0 ? Math.min((totalGasto / partner.limcred) * 100, 100) : 0

    // Últimos 12 meses
    const months = useMemo(() => {
        const now = new Date()
        return Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
            return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: MESES[d.getMonth()], year: d.getFullYear() }
        })
    }, [])

    const monthlyData = useMemo(() => {
        const map: Record<string, { total: number; count: number }> = {}
        activeSales.forEach(s => {
            const key = s.dtsaida.slice(0, 7)
            if (!map[key]) map[key] = { total: 0, count: 0 }
            map[key].total += Number(s.vltotal)
            map[key].count++
        })
        return map
    }, [activeSales])

    const maxMonthTotal = useMemo(() =>
        Math.max(...months.map(m => monthlyData[m.key]?.total ?? 0), 1),
        [months, monthlyData]
    )

    // Top filiais
    const topFiliais = useMemo(() => {
        const map: Record<string, { nome: string; total: number; count: number }> = {}
        activeSales.forEach(s => {
            const key = String(s.codfilial)
            if (!map[key]) map[key] = { nome: s.filial?.filial ?? `Filial ${s.codfilial}`, total: 0, count: 0 }
            map[key].total += Number(s.vltotal)
            map[key].count++
        })
        return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 4)
    }, [activeSales])

    const maxFilialTotal = topFiliais[0]?.total ?? 1
    const ultimaCompra   = sales[0]?.dtsaida ?? null

    // Stats do gráfico mensal
    const total12m   = useMemo(() => months.reduce((s, m) => s + (monthlyData[m.key]?.total ?? 0), 0), [months, monthlyData])
    const mediaMensal = useMemo(() => {
        const mesesComDados = months.filter(m => (monthlyData[m.key]?.total ?? 0) > 0).length
        return mesesComDados > 0 ? total12m / mesesComDados : 0
    }, [total12m, months, monthlyData])
    const melhorMes  = useMemo(() => {
        return months.reduce<{ label: string; total: number } | null>((best, m) => {
            const t = monthlyData[m.key]?.total ?? 0
            return (!best || t > best.total) ? { label: m.label, total: t } : best
        }, null)
    }, [months, monthlyData])

    // Tendência: mês atual vs mês anterior
    const currentMonthTotal = monthlyData[months[11]?.key]?.total ?? 0
    const prevMonthTotal    = monthlyData[months[10]?.key]?.total ?? 0
    const trend = prevMonthTotal > 0
        ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
        : null

    // Mini sparkline — últimos 6 meses
    const spark6 = months.slice(6).map(m => monthlyData[m.key]?.total ?? 0)
    const sparkMax = Math.max(...spark6, 1)

    // Dias desde a última compra
    const daysSinceLast = ultimaCompra
        ? Math.floor((Date.now() - new Date(ultimaCompra).getTime()) / 86_400_000)
        : null

    const totalSalesPages = Math.max(1, Math.ceil(sales.length / PER_PAGE))
    const pagedSales      = useMemo(
        () => sales.slice((salesPage - 1) * PER_PAGE, salesPage * PER_PAGE),
        [sales, salesPage, PER_PAGE]
    )
    const nowKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

    const initials = partner
        ? toTitleCase(partner.nome).split(' ').map(n => n[0]).slice(0, 2).join('')
        : '…'

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-(--muted-foreground) animate-[fade-in_0.2s_ease-out]">
                Carregando…
            </div>
        )
    }

    if (!partner) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 animate-[fade-in_0.2s_ease-out]">
                <p className="text-sm text-(--muted-foreground)">Funcionário não encontrado.</p>
                <button onClick={() => navigate('/funcionarios')} className="text-[0.72rem] text-(--primary) underline">
                    Voltar para lista
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">

            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">

                {/* Gradiente lateral ciano */}
                <div className="absolute inset-y-0 left-0 w-1/3 pointer-events-none"
                    style={{ background: 'linear-gradient(to right, color-mix(in oklch, var(--primary) 6%, transparent), transparent)' }} />

                {/* Dot grid decorativo */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
                    style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

                {/* Cantos decorativos */}
                {[
                    'top-0 left-0 border-t-2 border-l-2',
                    'top-0 right-0 border-t-2 border-r-2',
                    'bottom-0 left-0 border-b-2 border-l-2',
                    'bottom-0 right-0 border-b-2 border-r-2',
                ].map((cls, i) => (
                    <div key={i} className={`absolute w-4 h-4 border-(--primary)/40 ${cls}`} />
                ))}

                {/* ── Identidade ── */}
                <div className="relative flex items-start gap-5 px-7 pt-6 pb-5">

                    {/* Avatar */}
                    <div className="shrink-0 relative">
                        <div className="w-14 h-14 bg-(--primary)/10 border-2 border-(--primary)/30 flex items-center justify-center">
                            <span className="text-lg font-black text-(--primary) tracking-widest">{initials}</span>
                        </div>
                        {/* Pulse status */}
                        {!partner.bloqueado && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full bg-(--primary) opacity-50" />
                                <span className="relative inline-flex h-3 w-3 bg-(--primary)" />
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-[0.48rem] uppercase tracking-[0.3em] text-(--muted-foreground)">Funcionário</p>
                            {partner.bloqueado
                                ? <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/25 text-red-500 text-[0.47rem] font-bold uppercase tracking-widest flex items-center gap-0.5">
                                    <Ban size={7} /> Bloqueado
                                  </span>
                                : <span className="px-1.5 py-0.5 bg-(--primary)/10 border border-(--primary)/25 text-(--primary) text-[0.47rem] font-bold uppercase tracking-widest">
                                    Ativo
                                  </span>
                            }
                        </div>
                        <h1 className="text-(--foreground) font-black uppercase tracking-wide text-[1.3rem] leading-tight">
                            {toTitleCase(partner.nome)}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 mt-1.5">
                            <span className="text-(--muted-foreground) text-[0.6rem] tracking-widest font-mono">{formatCPF(partner.cpf)}</span>
                            {partner.matricula && (
                                <span className="text-(--muted-foreground) text-[0.6rem]">
                                    <span className="opacity-40 mr-1">|</span>Mat. {partner.matricula}
                                </span>
                            )}
                            {partner.empresa && (
                                <span className="text-(--muted-foreground) text-[0.6rem]">
                                    <span className="opacity-40 mr-1">|</span>{partner.empresa.nome}
                                </span>
                            )}
                            {daysSinceLast !== null && (
                                <span className="text-(--muted-foreground) text-[0.6rem]">
                                    <span className="opacity-40 mr-1">|</span>
                                    Última compra há <strong className="text-(--foreground)">{daysSinceLast}d</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Mini sparkline — últimos 6 meses */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <p className="text-[0.47rem] uppercase tracking-[0.2em] text-(--muted-foreground)">6 meses</p>
                        <div className="flex items-end gap-[3px]" style={{ height: 32 }}>
                            {spark6.map((v, i) => (
                                <div
                                    key={i}
                                    className="w-[6px] transition-all duration-500"
                                    style={{
                                        height: v > 0 ? `${Math.max((v / sparkMax) * 100, 8)}%` : '4%',
                                        background: v > 0
                                            ? i === 5 ? 'var(--primary)' : 'color-mix(in oklch, var(--primary) 55%, transparent)'
                                            : 'var(--border)',
                                    }}
                                    title={compactMoney(v)}
                                />
                            ))}
                        </div>
                        {trend !== null && (
                            <div className={`flex items-center gap-0.5 text-[0.52rem] font-bold ${trend >= 0 ? 'text-(--primary)' : 'text-red-500'}`}>
                                {trend >= 0
                                    ? <TrendingUp size={10} />
                                    : <TrendingDown size={10} />
                                }
                                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs mês ant.
                            </div>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="shrink-0 flex flex-col gap-1.5 self-start">
                        <button
                            onClick={() => navigate(`/funcionarios/${id}/editar`)}
                            className="flex items-center gap-1.5 border border-(--border) px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                        >
                            <Pencil size={10} /> Editar
                        </button>
                        <button
                            onClick={() => navigate('/funcionarios')}
                            className="flex items-center gap-1.5 border border-(--border) px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                        >
                            <ArrowLeft size={10} /> Voltar
                        </button>
                    </div>
                </div>

                {/* ── KPIs ── */}
                <div className="relative grid grid-cols-5 border-t border-(--border)">
                    {[
                        { label: 'Compras Ativas',  number: activeSales.length,   icon: ShoppingBag, decimals: 0 },
                        { label: 'Total Gasto',     number: totalGasto,            icon: TrendingUp,  decimals: 2 },
                        { label: 'Ticket Médio',    number: avgTicket,             icon: TrendingUp,  decimals: 2 },
                        { label: 'Lim. Crédito',    number: partner.limcred,       icon: CreditCard,  decimals: 2 },
                        { label: 'Cancelamentos',   number: canceledSales.length,  icon: Ban,         decimals: 0 },
                    ].map(({ label, number, icon: Icon, decimals }) => (
                        <div key={label} className="px-5 py-3 border-r border-(--border) last:border-r-0 bg-muted">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Icon size={9} className="text-(--primary) opacity-60" />
                                <p className="text-[0.47rem] uppercase tracking-[0.18em] text-(--muted-foreground)">{label}</p>
                            </div>
                            <p className="text-(--foreground) text-xl font-black tabular-nums leading-none mt-0.5">
                                {decimals > 0 && <span className="text-[0.55em] font-bold opacity-40 mr-0.5">R$</span>}
                                <CountingNumber
                                    number={number}
                                    decimalPlaces={decimals}
                                    decimalSeparator=","
                                    inView
                                    transition={{ duration: 80, bounce: 30 }}
                                    delay={100}
                                />
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Barra de utilização ── */}
                {partner.limcred > 0 && (
                    <div className="relative px-7 py-3 border-t border-(--border)">
                        <div className="flex justify-between mb-1.5">
                            <span className="text-(--muted-foreground) text-[0.47rem] uppercase tracking-[0.2em]">Utilização do limite</span>
                            <span className={`text-[0.47rem] font-bold ${pct > 85 ? 'text-red-500' : pct > 60 ? 'text-amber-500' : 'text-(--primary)'}`}>
                                {Math.round(pct)}%
                            </span>
                        </div>
                        <div className="h-0.5 bg-(--border) w-full">
                            <div
                                className="h-full transition-all duration-700"
                                style={{
                                    width: `${pct}%`,
                                    background: pct > 85 ? 'var(--destructive)' : pct > 60 ? '#f59e0b' : 'var(--primary)',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Grid: gráfico + filiais ────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">

                {/* Gráfico mensal — 2/3 */}
                <div className="col-span-2 bg-card border border-(--border) flex flex-col">
                    <div className="px-5 py-3 border-b border-(--border) bg-[oklch(0.97_0_0)]">
                        <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted-foreground)">
                            Gastos por Mês — últimos 12 meses
                        </span>
                    </div>
                    <div className="flex-1 flex items-end gap-0 px-5 pt-6 pb-4" style={{ minHeight: 180 }}>
                        {months.map((m, i) => {
                            const data  = monthlyData[m.key]
                            const total = data?.total ?? 0
                            const count = data?.count ?? 0
                            const height = maxMonthTotal > 0 ? Math.max((total / maxMonthTotal) * 100, total > 0 ? 4 : 0) : 0
                            const isCurrent = m.key === nowKey

                            return (
                                <div key={m.key} className="flex-1 flex flex-col items-center gap-1 group">
                                    {/* Valor acima da barra */}
                                    <span className="text-[0.47rem] font-bold text-(--muted-foreground) opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-0.5">
                                        {compactMoney(total)}
                                    </span>
                                    {/* Barra */}
                                    <div className="w-full flex items-end justify-center" style={{ height: 120 }}>
                                        <div
                                            className="w-[70%] transition-all duration-500 cursor-default relative"
                                            style={{
                                                height: `${height}%`,
                                                minHeight: total > 0 ? 3 : 0,
                                                background: total > 0 ? 'var(--primary)' : 'var(--border)',
                                                opacity: isCurrent ? 1 : total > 0 ? 0.55 : 0.4,
                                            }}
                                            title={total > 0 ? `${m.label}/${m.year}: ${formatMoney(total)} (${count} compra${count !== 1 ? 's' : ''})` : `${m.label}/${m.year}: sem compras`}
                                        />
                                    </div>
                                    {/* Label do mês */}
                                    <span className={`text-[0.5rem] uppercase tracking-wider mt-1 ${isCurrent ? 'text-(--primary) font-bold' : 'text-(--muted-foreground)'}`}>
                                        {m.label}
                                    </span>
                                    {count > 0 && (
                                        <span className="text-[0.44rem] text-(--muted-foreground) opacity-60">{count}x</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Top filiais — 1/3 */}
                <div className="bg-card border border-(--border) flex flex-col">
                    <div className="px-5 py-3 border-b border-(--border) bg-[oklch(0.97_0_0)]">
                        <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted-foreground)">
                            Lojas Frequentadas
                        </span>
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-3">
                        {topFiliais.length === 0 ? (
                            <p className="text-[0.75rem] text-(--muted-foreground) m-auto">Sem dados</p>
                        ) : topFiliais.map((f, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Store size={10} className="text-(--muted-foreground)" />
                                        <span className="text-[0.72rem] font-semibold text-(--foreground) truncate max-w-[130px]">{f.nome}</span>
                                    </div>
                                    <span className="text-[0.62rem] font-bold text-(--primary) shrink-0">{compactMoney(f.total)}</span>
                                </div>
                                <div className="h-[3px] bg-(--border) w-full">
                                    <div
                                        className="h-full bg-(--primary) opacity-70 transition-all duration-500"
                                        style={{ width: `${(f.total / maxFilialTotal) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[0.5rem] text-(--muted-foreground)">{f.count} compra{f.count !== 1 ? 's' : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tabela de compras ─────────────────────────────────────────── */}
            <div className="bg-card border border-(--border)">
                <div className="px-5 py-3 border-b border-(--border) bg-[oklch(0.97_0_0)] flex items-center justify-between">
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-(--muted-foreground)">
                        Histórico Completo
                    </span>
                    <span className="text-[0.6rem] text-(--muted-foreground)">
                        {sales.length} registro{sales.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[oklch(0.97_0_0)] border-b border-(--border)">
                                {['Data', 'Loja', 'Nº Nota', 'Valor', 'NFC-e', 'Status'].map(h => (
                                    <th key={h} className="px-4 py-2.5 text-left text-[0.58rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground) whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sales.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-sm text-(--muted-foreground)">
                                        Nenhuma compra registrada.
                                    </td>
                                </tr>
                            ) : pagedSales.map(sale => (
                                <tr
                                    key={sale.id}
                                    className={`border-b border-(--border) last:border-0 hover:bg-[oklch(0.97_0_0)] transition-colors ${sale.dtcancel ? 'opacity-45' : ''}`}
                                >
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-[2px] h-4 shrink-0 opacity-70"
                                                style={{ background: `hsl(${(sale.codfilial * 47) % 360}, 55%, 50%)` }}
                                            />
                                            <span className="text-[0.72rem] text-(--muted-foreground)">{formatDateFull(sale.dtsaida)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-[0.78rem] font-medium text-(--foreground)">
                                        {sale.filial?.filial ?? `Filial ${sale.codfilial}`}
                                    </td>
                                    <td className="px-4 py-2.5 text-[0.72rem] text-(--muted-foreground) tabular-nums">
                                        {sale.numnota}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`text-[0.82rem] font-bold tabular-nums ${sale.dtcancel ? 'text-(--muted-foreground) line-through' : 'text-(--primary)'}`}>
                                            {formatMoney(sale.vltotal)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sale.qrcodenfce && !sale.dtcancel ? (
                                            <a
                                                href={sale.qrcodenfce}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[0.62rem] text-(--muted-foreground) hover:text-(--primary) transition-colors"
                                            >
                                                <ExternalLink size={11} /> Ver nota
                                            </a>
                                        ) : (
                                            <span className="text-(--muted-foreground) opacity-30 text-[0.62rem]">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {sale.dtcancel
                                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                                                <Ban size={8} /> Cancelado {formatDate(sale.dtcancel)}
                                              </span>
                                            : sale.dtdevol
                                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                Devolvido {formatDate(sale.dtdevol)}
                                              </span>
                                            : <span className="text-[0.52rem] font-bold uppercase tracking-wider text-green-600">OK</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalSalesPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-(--border)">
                        <span className="text-[0.6rem] uppercase tracking-widest text-(--muted-foreground)">
                            Mostrando {((salesPage - 1) * PER_PAGE) + 1}–{Math.min(salesPage * PER_PAGE, sales.length)} de {sales.length}
                        </span>
                        <div className="flex gap-1">
                            {Array.from({ length: totalSalesPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setSalesPage(p)}
                                    className={`w-7 h-7 text-[0.68rem] font-semibold border transition-colors ${
                                        p === salesPage
                                            ? 'bg-(--primary) border-(--primary) text-white'
                                            : 'border-(--border) text-(--muted-foreground) hover:border-(--primary) hover:text-(--primary)'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
