import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Download, Users, TrendingUp, Award, ReceiptText, Loader2 } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, formatMoney, toTitleCase } from '@/lib/utils'

interface SaleGroup {
    cpf: string
    nome: string
    total: number
    quantidade: number
}

function formatDateBR(iso: string) {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

function formatDateLabel(iso: string) {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return `${d} ${meses[parseInt(m) - 1]} ${y}`
}

export default function SalesByPeriodPage() {
    const navigate = useNavigate()
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate]     = useState('')
    const [results, setResults]     = useState<SaleGroup[]>([])
    const [loading, setLoading]     = useState(false)
    const [searched, setSearched]   = useState(false)
    const [errors, setErrors]       = useState<{ start_date?: string[]; end_date?: string[] }>({})

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrors({})
        setLoading(true)
        setSearched(true)
        try {
            const res = await api.get('/sales/period', {
                params: { start_date: formatDateBR(startDate), end_date: formatDateBR(endDate) },
            })
            setResults(res.data)
        } catch (err: any) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    function exportCsv() {
        if (results.length === 0) return
        const rows = [
            ['CPF', 'Nome', 'Qtd Compras', 'Total'],
            ...results.map(r => [r.cpf, r.nome, String(r.quantidade), String(r.total)]),
        ]
        const blob = new Blob([rows.map(r => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = `compras_periodo_${startDate}_${endDate}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const grandTotal  = useMemo(() => results.reduce((s, r) => s + Number(r.total), 0), [results])
    const totalCompras = useMemo(() => results.reduce((s, r) => s + r.quantidade, 0), [results])
    const mediaFunc   = useMemo(() => results.length > 0 ? grandTotal / results.length : 0, [grandTotal, results])
    const maiorComp   = useMemo(() => results[0] ?? null, [results])
    const maxTotal    = useMemo(() => results[0]?.total ?? 1, [results])

    const corners = ['top-0 left-0 border-t-2 border-l-2','top-0 right-0 border-t-2 border-r-2','bottom-0 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2']

    return (
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">

            {/* ── Título ── */}
            <div>
                <p className="text-[0.5rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Relatórios</p>
                <h1 className="text-xl font-black uppercase tracking-[0.08em] text-(--foreground)">Extrato por Período</h1>
            </div>

            {/* ── Filtro ── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">
                {/* Faixa topo */}
                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 6%, transparent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {/* Cantos */}
                {corners.map((cls, i) => (
                    <div key={i} className={`absolute w-4 h-4 border-(--primary)/30 ${cls}`} />
                ))}

                <div className="relative px-7 py-5">
                    <p className="text-[0.48rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-4">
                        Selecionar Período
                    </p>
                    <form onSubmit={handleSubmit} className="flex items-end gap-4 flex-wrap">
                        {[
                            { id: 'start', label: 'Data Inicial', value: startDate, set: setStartDate, err: errors.start_date },
                            { id: 'end',   label: 'Data Final',   value: endDate,   set: setEndDate,   err: errors.end_date   },
                        ].map(({ id, label, value, set, err }) => (
                            <div key={id} className="flex flex-col gap-1.5">
                                <label className="text-[0.48rem] font-black uppercase tracking-[0.22em] text-(--muted-foreground)">
                                    {label}
                                </label>
                                <input
                                    type="date"
                                    value={value}
                                    onChange={e => set(e.target.value)}
                                    required
                                    className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors w-44 ${err ? 'border-(--destructive)' : 'border-(--border)'}`}
                                />
                                {err?.[0] && <p className="text-[0.62rem] text-(--destructive)">{err[0]}</p>}
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-(--primary) text-white px-6 py-2 text-[0.6rem] font-black uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-60 transition-opacity"
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                            {loading ? 'Buscando…' : 'Executar'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Resultados ── */}
            {searched && !loading && (
                <>
                    {/* Stats do período */}
                    {results.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Total no Período',       value: formatMoney(grandTotal),           sub: `${formatDateLabel(startDate)} → ${formatDateLabel(endDate)}`, icon: TrendingUp, highlight: true  },
                                { label: 'Funcionários',           value: String(results.length),            sub: 'com compras no período',                                        icon: Users,      highlight: false },
                                { label: 'Total de Compras',       value: String(totalCompras),              sub: `média de ${(totalCompras / results.length).toFixed(1)} por funcionário`, icon: ReceiptText, highlight: false },
                                { label: 'Maior Comprador',        value: formatMoney(maiorComp?.total ?? 0), sub: maiorComp ? toTitleCase(maiorComp.nome) : '—',                 icon: Award,      highlight: false },
                            ].map(({ label, value, sub, icon: Icon, highlight }) => (
                                <div key={label}
                                    className={`group relative border border-(--border) px-5 py-4 overflow-hidden cursor-default transition-all duration-200 ${highlight ? 'bg-(--primary)/5 hover:bg-(--primary)/10' : 'bg-card hover:bg-muted'}`}>
                                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-(--primary) transition-opacity duration-200 ${highlight ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Icon size={9} className={`transition-colors duration-200 ${highlight ? 'text-(--primary)' : 'text-(--muted-foreground) group-hover:text-(--primary)'}`} />
                                        <p className="text-[0.44rem] uppercase tracking-[0.22em] text-(--muted-foreground)">{label}</p>
                                    </div>
                                    <p className={`font-black leading-none mb-1.5 transition-colors duration-200 ${highlight ? 'text-xl text-(--primary)' : 'text-lg text-(--foreground) group-hover:text-(--primary)'}`}>
                                        {value}
                                    </p>
                                    <p className="text-[0.44rem] uppercase tracking-[0.12em] text-(--muted-foreground) truncate">{sub}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tabela */}
                    <div className="bg-card border border-(--border)">
                        <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center justify-between">
                            <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                {results.length > 0
                                    ? `${results.length} funcionário${results.length !== 1 ? 's' : ''} · ordenado por valor`
                                    : 'Nenhum resultado'}
                            </span>
                            {results.length > 0 && (
                                <button onClick={exportCsv}
                                    className="flex items-center gap-1.5 border border-(--border) px-3 py-1.5 text-[0.52rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors">
                                    <Download size={10} /> Exportar CSV
                                </button>
                            )}
                        </div>

                        {results.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-[0.8rem] font-semibold text-(--muted-foreground)">Nenhuma compra no período selecionado.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted border-b border-(--border)">
                                            <th className="px-5 py-3 text-left text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground) w-8">#</th>
                                            <th className="px-5 py-3 text-left text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Funcionário</th>
                                            <th className="px-5 py-3 text-left text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">CPF</th>
                                            <th className="px-5 py-3 text-center text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Compras</th>
                                            <th className="px-5 py-3 text-left text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Participação</th>
                                            <th className="px-5 py-3 text-right text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((r, idx) => {
                                            const pct = grandTotal > 0 ? (Number(r.total) / grandTotal) * 100 : 0
                                            const barW = maxTotal > 0 ? (Number(r.total) / maxTotal) * 100 : 0
                                            return (
                                                <tr
                                                    key={r.cpf}
                                                    onClick={() => {
                                                        // navega para o detalhe buscando por CPF
                                                    }}
                                                    className="group border-b border-(--border) last:border-0 hover:bg-muted transition-colors cursor-default"
                                                >
                                                    <td className="px-5 py-3">
                                                        <span className={`text-[0.52rem] font-black tabular-nums ${idx < 3 ? 'text-(--primary)' : 'text-(--muted-foreground) opacity-40'}`}>
                                                            {String(idx + 1).padStart(2, '0')}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-[0.78rem] font-semibold text-(--foreground) group-hover:text-(--primary) transition-colors">
                                                            {toTitleCase(r.nome)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-[0.65rem] text-(--muted-foreground) font-mono tracking-wider">{formatCPF(r.cpf)}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className="text-[0.72rem] font-black text-(--foreground) tabular-nums">{r.quantidade}</span>
                                                    </td>
                                                    <td className="px-5 py-3 w-40">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1 bg-(--border) overflow-hidden">
                                                                <div
                                                                    className="h-full bg-(--primary) opacity-60 group-hover:opacity-100 transition-all duration-500"
                                                                    style={{ width: `${barW}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[0.48rem] font-black text-(--muted-foreground) tabular-nums w-8 text-right shrink-0">
                                                                {pct.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <span className="text-[0.82rem] font-black text-(--primary) tabular-nums">
                                                            {formatMoney(r.total)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-(--border) bg-muted">
                                            <td colSpan={3} />
                                            <td className="px-5 py-3 text-center">
                                                <span className="text-[0.6rem] font-black text-(--foreground) tabular-nums">{totalCompras}</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-[0.48rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground)">100%</span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="text-sm font-black text-(--primary) tabular-nums">{formatMoney(grandTotal)}</span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Estado de carregamento */}
            {searched && loading && (
                <div className="bg-card border border-(--border) flex items-center justify-center py-16 gap-3">
                    <Loader2 size={16} className="animate-spin text-(--primary)" />
                    <span className="text-[0.72rem] font-semibold text-(--muted-foreground) uppercase tracking-wider">Buscando dados…</span>
                </div>
            )}
        </div>
    )
}
