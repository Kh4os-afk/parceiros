import { useMemo, useState } from 'react'
import { Search, ExternalLink, Ban, ShoppingBag, CalendarDays, CreditCard } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, formatMoney, stripCPF, toTitleCase } from '@/lib/utils'

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

interface Partner {
    id: number
    nome: string
    cpf: string
    matricula: string | null
    limcred: number
    bloqueado: number
    compras: Sale[]
}

const MESES_LABEL = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MESES_FULL  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function formatDateFull(iso: string) {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

function nowKey() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function last6Months() {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        return {
            key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: MESES_LABEL[d.getMonth()],
            full:  `${MESES_FULL[d.getMonth()]} ${d.getFullYear()}`,
            year:  d.getFullYear(),
        }
    })
}

const corners = [
    'top-0 left-0 border-t-2 border-l-2',
    'top-0 right-0 border-t-2 border-r-2',
    'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-0 right-0 border-b-2 border-r-2',
]

export default function ConsultaPage() {
    const [cpfInput,  setCpfInput]  = useState('')
    const [partner,   setPartner]   = useState<Partner | null>(null)
    const [loading,   setLoading]   = useState(false)
    const [notFound,  setNotFound]  = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(nowKey())

    const months = useMemo(() => last6Months(), [])

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        const cpf = stripCPF(cpfInput)
        if (cpf.length !== 11) return
        setLoading(true)
        setNotFound(false)
        setPartner(null)
        setSelectedMonth(nowKey())
        try {
            const res = await api.get('/sales/by-cpf', { params: { cpf } })
            setPartner(res.data)
        } catch {
            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }

    // Compras do mês selecionado (sem canceladas)
    const salesMonth = useMemo(() =>
        (partner?.compras ?? []).filter(s => s.dtsaida.slice(0, 7) === selectedMonth),
        [partner, selectedMonth]
    )
    const activeSalesMonth = useMemo(() => salesMonth.filter(s => !s.dtcancel), [salesMonth])
    const gastoMes   = useMemo(() => activeSalesMonth.reduce((s, c) => s + Number(c.vltotal), 0), [activeSalesMonth])
    const disponivel = partner ? Math.max(partner.limcred - gastoMes, 0) : 0
    const pct        = partner && partner.limcred > 0 ? Math.min((gastoMes / partner.limcred) * 100, 100) : 0
    const isCurrentMonth = selectedMonth === nowKey()

    // Totais por mês para os tabs
    const monthTotals = useMemo(() => {
        const map: Record<string, number> = {}
        ;(partner?.compras ?? []).filter(s => !s.dtcancel).forEach(s => {
            const k = s.dtsaida.slice(0, 7)
            map[k] = (map[k] ?? 0) + Number(s.vltotal)
        })
        return map
    }, [partner])

    const selectedMonthLabel = months.find(m => m.key === selectedMonth)?.full
        ?? MESES_FULL[new Date().getMonth()] + ' ' + new Date().getFullYear()

    return (
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">

            {/* ── Header ── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 6%, transparent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {corners.map((cls, i) => (
                    <div key={i} className={`absolute z-10 w-5 h-5 border-(--primary)/30 ${cls}`} />
                ))}

                <div className="relative px-7 py-5">
                    <p className="text-[0.5rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Convênio</p>
                    <h1 className="text-xl font-black uppercase tracking-[0.08em] text-(--foreground)">Consulta de Saldo</h1>
                    <p className="text-[0.62rem] text-(--muted-foreground) mt-1.5">
                        Consulte o limite disponível e o histórico de compras pelo CPF do funcionário.
                    </p>

                    {/* Busca por CPF */}
                    <form onSubmit={handleSearch} className="flex items-end gap-3 mt-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.5rem] font-black uppercase tracking-[0.22em] text-(--muted-foreground)">CPF do Funcionário</label>
                            <input
                                value={cpfInput}
                                onChange={e => setCpfInput(e.target.value)}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className="w-52 border border-(--border) px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) placeholder:text-(--muted-foreground) placeholder:opacity-40 transition-colors font-mono tracking-widest"
                            />
                        </div>
                        <button type="submit" disabled={loading || stripCPF(cpfInput).length !== 11}
                            className="flex items-center gap-2 bg-(--primary) text-white px-5 py-2 text-[0.58rem] font-black uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-50 transition-opacity">
                            <Search size={12} />
                            {loading ? 'Buscando…' : 'Consultar'}
                        </button>
                    </form>

                    {notFound && (
                        <p className="mt-3 text-[0.65rem] text-red-500 font-semibold">
                            CPF não encontrado na base de funcionários.
                        </p>
                    )}
                </div>
            </div>

            {partner && (
                <>
                    {/* ── Card de destaque ── */}
                    <div className="grid grid-cols-3 gap-4">

                        {/* Disponível — destaque principal */}
                        <div className={`col-span-2 relative border overflow-hidden flex flex-col justify-between p-8 ${
                            partner.bloqueado
                                ? 'bg-red-500/5 border-red-500/20'
                                : disponivel === 0
                                ? 'bg-amber-500/5 border-amber-500/20'
                                : 'bg-(--primary)/5 border-(--primary)/20'
                        }`}>
                            {/* Dot grid */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                                style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                            {corners.map((cls, i) => (
                                <div key={i} className={`absolute z-10 w-4 h-4 ${partner.bloqueado ? 'border-red-500/30' : 'border-(--primary)/25'} ${cls}`} />
                            ))}

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="text-[0.48rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Funcionário</p>
                                        <h2 className="text-[1.2rem] font-black uppercase tracking-wide text-(--foreground) leading-tight">
                                            {toTitleCase(partner.nome)}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[0.6rem] font-mono text-(--muted-foreground) tracking-widest">{formatCPF(partner.cpf)}</span>
                                            {partner.matricula && <span className="text-[0.6rem] text-(--muted-foreground)">Mat. {partner.matricula}</span>}
                                        </div>
                                    </div>
                                    {partner.bloqueado
                                        ? <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/25 text-red-500 text-[0.48rem] font-black uppercase tracking-widest">
                                            <Ban size={8} /> Bloqueado
                                          </span>
                                        : <span className="flex items-center gap-1.5 px-2 py-1 bg-(--primary)/10 border border-(--primary)/25 text-(--primary) text-[0.48rem] font-black uppercase tracking-widest">
                                            <span className="w-1.5 h-1.5 bg-(--primary) rounded-full" /> Ativo
                                          </span>
                                    }
                                </div>

                                {/* Valor disponível — mega destaque */}
                                <div className="mb-6">
                                    <p className="text-[0.48rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-2">
                                        {partner.bloqueado ? 'Conta Bloqueada' : isCurrentMonth ? 'Disponível para Compra' : `Disponível em ${selectedMonthLabel}`}
                                    </p>
                                    {partner.bloqueado ? (
                                        <p className="text-2xl font-black text-red-500 uppercase tracking-wide">Acesso suspenso</p>
                                    ) : (
                                        <p className={`text-[2.8rem] font-black tabular-nums leading-none ${
                                            disponivel === 0 ? 'text-amber-500' : 'text-(--primary)'
                                        }`}>
                                            <span className="text-[0.3em] font-bold opacity-60 mr-1">R$</span>
                                            {disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    )}
                                </div>

                                {/* Barra de utilização */}
                                {!partner.bloqueado && (
                                    <div>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-[0.48rem] uppercase tracking-[0.18em] text-(--muted-foreground)">
                                                {formatMoney(gastoMes)} usados de {formatMoney(partner.limcred)}
                                            </span>
                                            <span className={`text-[0.48rem] font-black ${pct > 85 ? 'text-red-500' : pct > 60 ? 'text-amber-500' : 'text-(--primary)'}`}>
                                                {Math.round(pct)}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-(--border) w-full">
                                            <div className="h-full transition-all duration-700"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: pct > 85 ? 'var(--destructive)' : pct > 60 ? '#f59e0b' : 'var(--primary)',
                                                }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info lateral */}
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Limite Mensal',    value: formatMoney(partner.limcred),    icon: CreditCard,    color: 'default' },
                                { label: 'Gasto no Mês',     value: formatMoney(gastoMes),            icon: ShoppingBag,   color: gastoMes > partner.limcred ? 'red' : 'default' },
                                { label: 'Compras no Mês',   value: `${activeSalesMonth.length} compra${activeSalesMonth.length !== 1 ? 's' : ''}`, icon: CalendarDays, color: 'default' },
                            ].map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="bg-card border border-(--border) px-5 py-4 flex items-center gap-3">
                                    <div className={`w-9 h-9 flex items-center justify-center border shrink-0 ${
                                        color === 'red'
                                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                            : 'bg-(--primary)/8 border-(--primary)/20 text-(--primary)'
                                    }`}>
                                        <Icon size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[0.47rem] uppercase tracking-[0.2em] text-(--muted-foreground)">{label}</p>
                                        <p className="text-[0.9rem] font-black text-(--foreground) tabular-nums">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Seletor de mês + tabela ── */}
                    <div className="bg-card border border-(--border)">
                        {/* Tabs de mês */}
                        <div className="flex border-b border-(--border) bg-muted overflow-x-auto">
                            {months.map(m => {
                                const total    = monthTotals[m.key] ?? 0
                                const isSel    = m.key === selectedMonth
                                const isCurr   = m.key === nowKey()
                                return (
                                    <button
                                        key={m.key}
                                        onClick={() => setSelectedMonth(m.key)}
                                        className={`flex flex-col items-center px-5 py-3 border-b-2 transition-all shrink-0 ${
                                            isSel
                                                ? 'border-b-(--primary) bg-card'
                                                : 'border-b-transparent hover:bg-card/60'
                                        }`}
                                    >
                                        <span className={`text-[0.5rem] font-black uppercase tracking-[0.18em] ${isSel ? 'text-(--primary)' : isCurr ? 'text-(--foreground)' : 'text-(--muted-foreground)'}`}>
                                            {m.label}{isCurr ? ' ●' : ''}
                                        </span>
                                        {total > 0
                                            ? <span className={`text-[0.62rem] font-black tabular-nums mt-0.5 ${isSel ? 'text-(--primary)' : 'text-(--muted-foreground)'}`}>
                                                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                              </span>
                                            : <span className="text-[0.55rem] text-(--muted-foreground) opacity-40 mt-0.5">sem compras</span>
                                        }
                                    </button>
                                )
                            })}
                        </div>

                        {/* Header da tabela */}
                        <div className="px-6 py-3 border-b border-(--border) flex items-center justify-between">
                            <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                Compras — {selectedMonthLabel}
                            </span>
                            <span className="text-[0.5rem] uppercase tracking-[0.15em] text-(--muted-foreground)">
                                {salesMonth.length} registro{salesMonth.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Tabela */}
                        {salesMonth.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 gap-2">
                                <ShoppingBag size={26} className="text-(--muted-foreground) opacity-20" />
                                <p className="text-[0.78rem] text-(--muted-foreground)">Nenhuma compra em {selectedMonthLabel}.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted border-b border-(--border)">
                                            {['Data', 'Loja', 'Nº Nota', 'Valor', 'NFC-e', 'Status'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground) whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesMonth.map(sale => (
                                            <tr key={sale.id} className={`group border-b border-(--border) last:border-0 hover:bg-muted transition-colors ${sale.dtcancel ? 'opacity-40' : ''}`}>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-0.5 h-5 shrink-0 opacity-60"
                                                            style={{ background: `hsl(${(sale.codfilial * 47) % 360}, 55%, 50%)` }} />
                                                        <span className="text-[0.7rem] text-(--muted-foreground) tabular-nums">{formatDateFull(sale.dtsaida)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="text-[0.75rem] font-semibold text-(--foreground)">
                                                        {sale.filial?.filial ?? `Filial ${sale.codfilial}`}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="text-[0.68rem] font-mono text-(--muted-foreground)">{sale.numnota}</span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`text-[0.82rem] font-black tabular-nums ${sale.dtcancel ? 'text-(--muted-foreground) line-through' : 'text-(--primary)'}`}>
                                                        {formatMoney(sale.vltotal)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {sale.qrcodenfce && !sale.dtcancel
                                                        ? <a href={sale.qrcodenfce} target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[0.6rem] font-semibold text-(--muted-foreground) hover:text-(--primary) transition-colors uppercase tracking-wider">
                                                            <ExternalLink size={10} /> Ver nota
                                                          </a>
                                                        : <span className="text-(--muted-foreground) opacity-25">—</span>
                                                    }
                                                </td>
                                                <td className="px-5 py-3">
                                                    {sale.dtcancel
                                                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.15em] bg-red-500/10 text-red-500 border border-red-500/20">
                                                            <Ban size={7} /> Cancelado
                                                          </span>
                                                        : <span className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-green-600">OK</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {activeSalesMonth.length > 0 && (
                                        <tfoot>
                                            <tr className="border-t-2 border-(--border) bg-muted">
                                                <td colSpan={3} />
                                                <td className="px-5 py-3">
                                                    <span className="text-[0.82rem] font-black text-(--primary) tabular-nums">
                                                        {formatMoney(gastoMes)}
                                                    </span>
                                                </td>
                                                <td colSpan={2} />
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
