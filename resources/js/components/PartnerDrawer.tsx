import { useEffect, useState } from 'react'
import { X, ShoppingBag, TrendingUp, CreditCard, Calendar, ExternalLink } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, formatMoney, toTitleCase } from '@/lib/utils'

interface Partner {
    id: number
    nome: string
    cpf: string
    matricula: string | null
    limcred: number
    bloqueado: number
}

interface Sale {
    id: number
    numnota: string
    dtsaida: string
    vltotal: number
    codfilial: number
    qrcodenfce: string | null
    dtcancel: string | null
    filial?: { filial: string }
}

interface Props {
    partner: Partner | null
    onClose: () => void
}

function formatDate(iso: string) {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

export default function PartnerDrawer({ partner, onClose }: Props) {
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (!partner) { setMounted(false); return }
        setSales([])
        setLoading(true)
        // pequeno delay para garantir que o CSS de entrada seja disparado
        requestAnimationFrame(() => setMounted(true))
        api.get(`/partners/${partner.id}/sales`)
            .then(res => setSales(res.data))
            .finally(() => setLoading(false))
    }, [partner])

    function close() {
        setMounted(false)
        setTimeout(onClose, 280)
    }

    if (!partner) return null

    const activeSales = sales.filter(s => !s.dtcancel)
    const totalGasto  = activeSales.reduce((s, c) => s + Number(c.vltotal), 0)
    const ultimaCompra = sales[0]?.dtsaida ?? null
    const pct = partner.limcred > 0 ? Math.min((totalGasto / partner.limcred) * 100, 100) : 0
    const initials = toTitleCase(partner.nome).split(' ').map(n => n[0]).slice(0, 2).join('')

    const stats = [
        { label: 'Compras',      value: loading ? '…' : String(activeSales.length), icon: ShoppingBag },
        { label: 'Total Gasto',  value: loading ? '…' : formatMoney(totalGasto),    icon: TrendingUp  },
        { label: 'Lim. Crédito', value: formatMoney(partner.limcred),               icon: CreditCard  },
        { label: 'Última Compra',value: ultimaCompra ? formatDate(ultimaCompra) : '—', icon: Calendar },
    ]

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={close}
                style={{ transition: 'opacity 280ms ease' }}
                className={`fixed inset-0 z-40 bg-black/55 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Panel */}
            <div
                style={{ transition: 'transform 280ms cubic-bezier(0.4,0,0.2,1)' }}
                className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-card shadow-2xl flex flex-col ${mounted ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* ── Header escuro ── */}
                <div className="relative bg-(--foreground) px-6 pt-7 pb-5 shrink-0 overflow-hidden">
                    {/* Linha de acento ciano */}
                    <div className="absolute left-0 inset-y-0 w-[3px] bg-(--primary)" />

                    {/* Padrão decorativo sutil */}
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 24px)',
                        }}
                    />

                    <button
                        onClick={close}
                        className="absolute top-4 right-4 text-white/30 hover:text-white/80 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    {/* Identidade */}
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 border border-(--primary)/40 bg-(--primary)/15 flex items-center justify-center">
                            <span className="text-base font-black text-(--primary) tracking-wider">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                            <p className="text-white/40 text-[0.5rem] uppercase tracking-[0.25em] mb-0.5">Funcionário</p>
                            <h2 className="text-white font-black uppercase tracking-wide text-[1.05rem] leading-tight truncate">
                                {toTitleCase(partner.nome)}
                            </h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-white/45 text-[0.63rem] tracking-widest">{formatCPF(partner.cpf)}</span>
                                {partner.matricula && (
                                    <>
                                        <span className="text-white/20">·</span>
                                        <span className="text-white/40 text-[0.63rem]">Mat. {partner.matricula}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="shrink-0 mt-0.5">
                            {partner.bloqueado
                                ? <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[0.52rem] font-bold uppercase tracking-widest">Bloqueado</span>
                                : <span className="px-2 py-0.5 bg-(--primary)/20 border border-(--primary)/40 text-(--primary) text-[0.52rem] font-bold uppercase tracking-widest">Ativo</span>
                            }
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-4 gap-px mt-5 bg-card/8">
                        {stats.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-card/5 px-3 py-2.5">
                                <Icon size={10} className="text-white/25 mb-1.5" />
                                <p className="text-white/35 text-[0.48rem] uppercase tracking-[0.15em] leading-none mb-1">{label}</p>
                                <p className="text-white text-[0.75rem] font-bold leading-tight">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Barra de utilização de crédito */}
                    {!loading && partner.limcred > 0 && totalGasto > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between mb-1.5">
                                <span className="text-white/35 text-[0.48rem] uppercase tracking-[0.15em]">Utilização do limite</span>
                                <span className="text-white/35 text-[0.48rem]">{Math.round(pct)}%</span>
                            </div>
                            <div className="h-[2px] bg-card/10 w-full">
                                <div
                                    className="h-full bg-(--primary) transition-all duration-700 ease-out"
                                    style={{ width: `${pct}%`, transitionDelay: '200ms' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Subheader da lista ── */}
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-(--border) bg-muted shrink-0">
                    <span className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-(--muted-foreground)">
                        Histórico de Compras
                    </span>
                    {!loading && (
                        <span className="text-[0.58rem] text-(--muted-foreground)">
                            {sales.length} registro{sales.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* ── Lista de compras ── */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-sm text-(--muted-foreground)">
                            Carregando…
                        </div>
                    ) : sales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2">
                            <ShoppingBag size={26} className="text-(--muted-foreground) opacity-20" />
                            <p className="text-[0.78rem] text-(--muted-foreground)">Nenhuma compra registrada</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-(--border)">
                            {sales.map((sale, i) => (
                                <div
                                    key={sale.id}
                                    className={`flex items-center px-5 py-3 gap-4 hover:bg-muted transition-colors ${sale.dtcancel ? 'opacity-45' : ''}`}
                                    style={{ animationDelay: `${i * 20}ms` }}
                                >
                                    {/* Linha vertical colorida por filial */}
                                    <div
                                        className="w-[2px] self-stretch shrink-0 opacity-60"
                                        style={{ background: `hsl(${(sale.codfilial * 47) % 360}, 55%, 55%)` }}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[0.78rem] font-semibold text-(--foreground) truncate">
                                                {sale.filial?.filial ?? `Filial ${sale.codfilial}`}
                                            </span>
                                            {sale.dtcancel && (
                                                <span className="shrink-0 text-[0.48rem] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-200">
                                                    Cancelado
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[0.62rem] text-(--muted-foreground)">{formatDate(sale.dtsaida)}</span>
                                            <span className="text-(--muted-foreground) opacity-30">·</span>
                                            <span className="text-[0.62rem] text-(--muted-foreground)">Nota {sale.numnota}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 shrink-0">
                                        <span className={`text-[0.88rem] font-bold tabular-nums ${sale.dtcancel ? 'text-(--muted-foreground) line-through' : 'text-(--primary)'}`}>
                                            {formatMoney(sale.vltotal)}
                                        </span>
                                        {sale.qrcodenfce && !sale.dtcancel && (
                                            <a
                                                href={sale.qrcodenfce}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Ver NFC-e"
                                                className="text-(--muted-foreground) hover:text-(--primary) transition-colors"
                                            >
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
