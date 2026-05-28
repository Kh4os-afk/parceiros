import { useMemo, useRef, useState } from 'react'
import { Search, ExternalLink, Ban, ShoppingBag, ChevronRight, Loader2 } from 'lucide-react'
import api from '@/lib/axios'
import { formatMoney, stripCPF, toTitleCase } from '@/lib/utils'
import { vh } from 'motion/react'

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
        }
    })
}

function formatDateFull(iso: string) {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

// Mascara CPF: 000.000.000-00
function maskCPF(raw: string): string {
    const d = raw.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

export default function SaldoPage() {
    const [cpfInput,      setCpfInput]      = useState('')
    const [partner,       setPartner]       = useState<Partner | null>(null)
    const [loading,       setLoading]       = useState(false)
    const [notFound,      setNotFound]      = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(nowKey())
    const resultRef = useRef<HTMLDivElement>(null)
    const months    = useMemo(() => last6Months(), [])

    function handleCPF(e: React.ChangeEvent<HTMLInputElement>) {
        setCpfInput(maskCPF(e.target.value))
        setNotFound(false)
    }

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        const cpf = stripCPF(cpfInput)
        if (cpf.length !== 11) return
        setLoading(true)
        setNotFound(false)
        setPartner(null)
        setSelectedMonth(nowKey())
        try {
            const res = await api.get('/saldo', { params: { cpf } })
            setPartner(res.data)
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
        } catch {
            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }

    const salesMonth       = useMemo(() => (partner?.compras ?? []).filter(s => s.dtsaida.slice(0, 7) === selectedMonth), [partner, selectedMonth])
    const activeSalesMonth = useMemo(() => salesMonth.filter(s => !s.dtcancel), [salesMonth])
    const gastoMes         = useMemo(() => activeSalesMonth.reduce((s, c) => s + Number(c.vltotal), 0), [activeSalesMonth])
    const disponivel       = partner ? Math.max(partner.limcred - gastoMes, 0) : 0
    const pct              = partner && partner.limcred > 0 ? Math.min((gastoMes / partner.limcred) * 100, 100) : 0
    const isCurrentMonth   = selectedMonth === nowKey()
    const cpfOk            = stripCPF(cpfInput).length === 11

    const monthTotals = useMemo(() => {
        const map: Record<string, number> = {}
        ;(partner?.compras ?? []).filter(s => !s.dtcancel).forEach(s => {
            const k = s.dtsaida.slice(0, 7)
            map[k] = (map[k] ?? 0) + Number(s.vltotal)
        })
        return map
    }, [partner])

    const selectedLabel = months.find(m => m.key === selectedMonth)?.full
        ?? `${MESES_FULL[new Date().getMonth()]} ${new Date().getFullYear()}`

    const availColor = partner?.bloqueado ? '#ef4444'
        : pct > 85    ? '#f59e0b'
        :                'var(--primary)'

    return (
        <div className="flex flex-col" style={{ height: "100vhd" }}>

            {/* ══════════ HERO / BUSCA ══════════ */}
            <div className="relative flex flex-col flex-1"
                style={{ background: 'linear-gradient(42deg, #ff2222, #00c245f0)' }}>

                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {/* Cantos decorativos */}
                {['top-3 left-3 border-t-2 border-l-2','top-3 right-3 border-t-2 border-r-2','bottom-3 left-3 border-b-2 border-l-2','bottom-3 right-3 border-b-2 border-r-2'].map((cls, i) => (
                    <div key={i} className={`absolute w-6 h-6 border-white/20 ${cls}`} />
                ))}

                <div className="relative flex flex-col flex-1 max-w-md mx-auto w-full px-6 py-10">

                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-auto">
                        <div className="w-10 h-10 bg-white/15 border border-white/25 flex items-center justify-center">
                            <ShoppingBag size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white/60 text-[0.42rem] uppercase tracking-[0.4em]">Sistema de Convênio</p>
                            <p className="text-white font-black text-[0.88rem] uppercase tracking-wide">Baratão da Carne</p>
                        </div>
                    </div>

                    {/* Título */}
                    <div className="mt-10 mb-8">
                        <h1 className="text-white font-black text-[2rem] uppercase leading-none tracking-wide mb-3">
                            Consulte<br />seu saldo
                        </h1>
                        <p className="text-white/60 text-[0.65rem] leading-relaxed max-w-xs">
                            Digite seu CPF para ver o limite disponível e o histórico de compras do mês.
                        </p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSearch} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-white/60 text-[0.5rem] uppercase tracking-[0.25em] font-bold">
                                CPF
                            </label>
                            <input
                                value={cpfInput}
                                onChange={handleCPF}
                                placeholder="000.000.000-00"
                                inputMode="numeric"
                                maxLength={14}
                                className="w-full bg-white/12 border-2 border-white/25 text-white placeholder:text-white/30 px-4 py-4 text-xl font-mono tracking-[0.18em] outline-none focus:border-white/60 focus:bg-white/18 transition-all"
                            />
                            {notFound && (
                                <p className="text-white/90 text-[0.65rem] font-semibold bg-black/20 px-3 py-2">
                                    ✕ CPF não encontrado na base de funcionários.
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!cpfOk || loading}
                            className="flex items-center justify-center gap-2 bg-white py-4 text-[0.65rem] font-black uppercase tracking-[0.22em] disabled:opacity-40 hover:opacity-90 transition-opacity mt-1"
                            style={{ color: '#cc1111' }}
                        >
                            {loading
                                ? <><Loader2 size={15} className="animate-spin" /> Consultando…</>
                                : <><Search size={14} /> Consultar Saldo</>
                            }
                        </button>
                    </form>

                    {/* Instrução discreta */}
                    {!partner && !loading && (
                        <p className="mt-auto pt-10 text-center text-white/30 text-[0.5rem] uppercase tracking-[0.25em]">
                            Baratão da Carne · {new Date().getFullYear()}
                        </p>
                    )}
                </div>
            </div>

            {/* ══════════ RESULTADO ══════════ */}
            {partner && (
                <div ref={resultRef} className="bg-muted flex flex-col gap-0 max-w-md mx-auto w-full">

                    {/* Identificação */}
                    <div className="bg-card border-b border-(--border) px-5 py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[0.46rem] uppercase tracking-[0.28em] text-(--muted-foreground) mb-0.5">Funcionário</p>
                            <p className="text-[0.92rem] font-black text-(--foreground) uppercase leading-tight truncate">
                                {toTitleCase(partner.nome)}
                            </p>
                            <p className="text-[0.58rem] font-mono text-(--muted-foreground) tracking-widest mt-0.5">
                                {maskCPF(partner.cpf)}
                                {partner.matricula ? ` · Mat. ${partner.matricula}` : ''}
                            </p>
                        </div>
                        {partner.bloqueado
                            ? <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[0.46rem] font-black uppercase tracking-widest">
                                <Ban size={7} /> Bloqueado
                              </span>
                            : <span className="shrink-0 flex items-center gap-1.5 text-[0.5rem] font-black uppercase tracking-widest text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full" /> Ativo
                              </span>
                        }
                    </div>

                    {/* Hero disponível */}
                    <div className="bg-card px-5 py-8 text-center border-b border-(--border)">
                        <p className="text-[0.48rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-4">
                            {partner.bloqueado ? 'Conta bloqueada'
                                : isCurrentMonth ? 'Disponível para compra'
                                : `Disponível em ${selectedLabel}`}
                        </p>

                        {partner.bloqueado ? (
                            <p className="text-xl font-black text-red-500 uppercase">Acesso suspenso</p>
                        ) : (
                            <p className="font-black tabular-nums leading-none" style={{ fontSize: '3rem', color: availColor }}>
                                <span style={{ fontSize: '0.28em', opacity: 0.5, marginRight: 4 }}>R$</span>
                                {disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        )}

                        {!partner.bloqueado && (
                            <div className="mt-6 max-w-xs mx-auto">
                                <div className="h-2.5 bg-muted w-full mb-2">
                                    <div className="h-full transition-all duration-700"
                                        style={{ width: `${pct}%`, background: availColor }} />
                                </div>
                                <div className="flex justify-between text-[0.55rem] text-(--muted-foreground)">
                                    <span>Gasto: <strong className="text-(--foreground)">{formatMoney(gastoMes)}</strong></span>
                                    <span>Limite: <strong className="text-(--foreground)">{formatMoney(partner.limcred)}</strong></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabs de mês */}
                    <div className="bg-card border-b border-(--border)">
                        <div className="flex overflow-x-auto border-b border-(--border)" style={{ scrollbarWidth: 'none' }}>
                            {months.map(m => {
                                const total = monthTotals[m.key] ?? 0
                                const isSel = m.key === selectedMonth
                                const isCurr = m.key === nowKey()
                                return (
                                    <button key={m.key} onClick={() => setSelectedMonth(m.key)}
                                        className={`flex-1 min-w-[68px] flex flex-col items-center py-3 px-2 border-b-2 transition-all ${isSel ? 'border-b-(--primary) bg-card' : 'border-b-transparent bg-muted'}`}>
                                        <span className={`text-[0.5rem] font-black uppercase tracking-[0.12em] ${isSel ? 'text-(--primary)' : isCurr ? 'text-(--foreground)' : 'text-(--muted-foreground)'}`}>
                                            {m.label}{isCurr ? ' ●' : ''}
                                        </span>
                                        <span className={`text-[0.56rem] tabular-nums mt-0.5 ${isSel ? 'text-(--primary) font-black' : 'text-(--muted-foreground)'}`}>
                                            {total > 0
                                                ? `R$${total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
                                                : <span className="opacity-30">—</span>
                                            }
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Header */}
                        <div className="px-4 py-3 bg-muted flex items-center justify-between">
                            <span className="text-[0.54rem] font-black uppercase tracking-[0.18em] text-(--muted-foreground)">
                                {selectedLabel}
                            </span>
                            <span className="text-[0.5rem] text-(--muted-foreground)">
                                {activeSalesMonth.length} compra{activeSalesMonth.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Lista de compras */}
                    <div className="bg-card divide-y divide-(--border)">
                        {salesMonth.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <ShoppingBag size={30} className="text-(--muted-foreground) opacity-15" />
                                <p className="text-[0.72rem] text-(--muted-foreground)">Sem compras em {selectedLabel}.</p>
                            </div>
                        ) : salesMonth.map(sale => (
                            <div key={sale.id} className={`flex items-center gap-3 px-4 py-4 ${sale.dtcancel ? 'opacity-40' : ''}`}>
                                <div className="w-0.5 h-11 shrink-0 rounded-full"
                                    style={{ background: `hsl(${(sale.codfilial * 47) % 360}, 55%, 50%)`, opacity: 0.7 }} />

                                <div className="flex-1 min-w-0">
                                    <p className="text-[0.78rem] font-semibold text-(--foreground) truncate">
                                        {sale.filial?.filial ?? `Filial ${sale.codfilial}`}
                                    </p>
                                    <p className="text-[0.6rem] text-(--muted-foreground) mt-0.5">
                                        {formatDateFull(sale.dtsaida)} · Nota {sale.numnota}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className={`text-[0.9rem] font-black tabular-nums ${sale.dtcancel ? 'text-(--muted-foreground) line-through' : 'text-(--primary)'}`}>
                                        {formatMoney(sale.vltotal)}
                                    </span>
                                    {sale.dtcancel
                                        ? <span className="text-[0.46rem] font-black uppercase text-red-500">Cancelado</span>
                                        : sale.qrcodenfce
                                            ? <a href={sale.qrcodenfce} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-0.5 text-[0.5rem] text-(--muted-foreground)">
                                                <ExternalLink size={9} /> NFC-e
                                              </a>
                                            : null
                                    }
                                </div>
                                <ChevronRight size={13} className="text-(--muted-foreground) opacity-20 shrink-0" />
                            </div>
                        ))}

                        {activeSalesMonth.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-4 bg-muted">
                                <span className="text-[0.52rem] font-black uppercase tracking-[0.18em] text-(--muted-foreground)">Total do mês</span>
                                <span className="text-[0.9rem] font-black tabular-nums" style={{ color: availColor }}>
                                    {formatMoney(gastoMes)}
                                </span>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-[0.48rem] text-(--muted-foreground) uppercase tracking-[0.22em] py-5">
                        Baratão da Carne · Sistema de Convênio
                    </p>
                </div>
            )}
        </div>
    )
}
