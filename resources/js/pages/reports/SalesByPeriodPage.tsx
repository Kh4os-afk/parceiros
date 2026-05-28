import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, formatMoney, toTitleCase } from '@/lib/utils'

interface SaleGroup {
    cpf: string
    nome: string
    total: number
    quantidade: number
}

export default function SalesByPeriodPage() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [results, setResults] = useState<SaleGroup[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [errors, setErrors] = useState<{ start_date?: string[]; end_date?: string[] }>({})

    function formatDateBR(iso: string) {
        if (!iso) return ''
        const [y, m, d] = iso.split('-')
        return `${d}/${m}/${y}`
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrors({})
        setLoading(true)
        setSearched(true)
        try {
            const res = await api.get('/sales/period', {
                params: {
                    start_date: formatDateBR(startDate),
                    end_date: formatDateBR(endDate),
                },
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
        const csv = rows.map(r => r.join(';')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compras_periodo_${startDate}_${endDate}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const grandTotal = results.reduce((sum, r) => sum + Number(r.total), 0)

    return (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
            <div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Relatórios</p>
                <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">Compras por Período</h1>
            </div>

            <div className="bg-card border border-(--border)">
                <div className="px-5 py-3 border-b border-(--border) bg-muted">
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">Filtrar Período</span>
                </div>
                <form onSubmit={handleSubmit} className="p-5 flex items-end gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Data Inicial</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            required
                            className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors.start_date ? 'border-(--destructive)' : 'border-(--border)'}`}
                        />
                        {errors.start_date?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors.start_date[0]}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Data Final</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            required
                            className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors.end_date ? 'border-(--destructive)' : 'border-(--border)'}`}
                        />
                        {errors.end_date?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors.end_date[0]}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-1.5 bg-(--primary) text-white px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity"
                    >
                        <Search size={12} />
                        {loading ? 'Buscando…' : 'Buscar'}
                    </button>
                </form>
            </div>

            {searched && (
                <div className="bg-card border border-(--border)">
                    <div className="px-5 py-3 border-b border-(--border) bg-muted flex items-center justify-between">
                        <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">
                            {results.length} funcionário{results.length !== 1 ? 's' : ''} com compras no período
                        </span>
                        {results.length > 0 && (
                            <button
                                onClick={exportCsv}
                                className="flex items-center gap-1.5 border border-(--border) px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                            >
                                <Download size={11} /> Exportar CSV
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted border-b border-(--border)">
                                    {['CPF', 'Nome', 'Qtd. Compras', 'Total'].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center py-10 text-sm text-(--muted-foreground)">Carregando…</td></tr>
                                ) : results.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-10 text-sm text-(--muted-foreground)">Nenhuma compra encontrada no período.</td></tr>
                                ) : results.map(r => (
                                    <tr key={r.cpf} className="border-b border-(--border) last:border-0 hover:bg-muted transition-colors">
                                        <td className="px-4 py-2.5 text-[0.75rem] text-(--muted-foreground) tracking-wider">{formatCPF(r.cpf)}</td>
                                        <td className="px-4 py-2.5 text-sm font-medium text-(--foreground)">{toTitleCase(r.nome)}</td>
                                        <td className="px-4 py-2.5 text-[0.78rem] text-center text-(--muted-foreground)">{r.quantidade}</td>
                                        <td className="px-4 py-2.5 text-[0.78rem] font-semibold text-(--primary)">{formatMoney(r.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {results.length > 0 && (
                                <tfoot>
                                    <tr className="border-t border-(--border) bg-muted">
                                        <td colSpan={3} className="px-4 py-2.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground) text-right">Total Geral</td>
                                        <td className="px-4 py-2.5 text-sm font-black text-(--primary)">{formatMoney(grandTotal)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
