import { useState, useEffect, useCallback } from 'react'
import { Search, Download } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, formatMoney, toTitleCase } from '@/lib/utils'

interface Partner {
    id: number
    nome: string
    cpf: string
    matricula: string
}

interface Sale {
    id: number
    numnota: string
    dtsaida: string
    vltotal: number
    codfilial: number
    filial?: { filial: string }
}

export default function SalesByPartnerPage() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<Partner | null>(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const [sales, setSales] = useState<Sale[]>([])
    const [loadingSales, setLoadingSales] = useState(false)
    const [searched, setSearched] = useState(false)

    useEffect(() => {
        if (search.length < 2) { setPartners([]); return }
        const timer = setTimeout(async () => {
            const res = await api.get('/partners', { params: { search, per_page: 20 } })
            setPartners(res.data.data ?? [])
            setShowDropdown(true)
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const fetchSales = useCallback(async (partner: Partner) => {
        setLoadingSales(true)
        setSearched(true)
        setSales([])
        try {
            const res = await api.get(`/partners/${partner.id}/sales`)
            setSales(res.data)
        } finally {
            setLoadingSales(false)
        }
    }, [])

    function selectPartner(p: Partner) {
        setSelected(p)
        setSearch(toTitleCase(p.nome))
        setShowDropdown(false)
        fetchSales(p)
    }

    function exportCsv() {
        if (!selected || sales.length === 0) return
        const rows = [
            ['Nota', 'Data', 'Filial', 'Valor'],
            ...sales.map(s => [s.numnota, s.dtsaida, s.filial?.filial ?? s.codfilial, String(s.vltotal)]),
        ]
        const csv = rows.map(r => r.join(';')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compras_${selected.cpf}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const total = sales.reduce((sum, s) => sum + Number(s.vltotal), 0)

    return (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
            <div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Relatórios</p>
                <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">Compras por Funcionário</h1>
            </div>

            <div className="bg-card border border-(--border)">
                <div className="px-5 py-3 border-b border-(--border) bg-muted">
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">Selecionar Funcionário</span>
                </div>
                <div className="p-5">
                    <div className="relative max-w-md">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setSelected(null); setSales([]); setSearched(false) }}
                            onFocus={() => partners.length > 0 && setShowDropdown(true)}
                            placeholder="Buscar por nome, CPF ou matrícula…"
                            className="w-full pl-8 pr-3 py-2 text-sm border border-(--border) bg-muted text-(--foreground) outline-none focus:border-(--primary) placeholder:text-(--muted-foreground) placeholder:opacity-60"
                        />
                        {showDropdown && partners.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-20 bg-card border border-(--border) border-t-0 shadow-sm max-h-60 overflow-y-auto">
                                {partners.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => selectPartner(p)}
                                        className="w-full text-left px-3 py-2.5 hover:bg-muted border-b border-(--border) last:border-0 flex items-center justify-between gap-3"
                                    >
                                        <span className="text-sm font-medium text-(--foreground)">{toTitleCase(p.nome)}</span>
                                        <span className="text-[0.68rem] text-(--muted-foreground) tracking-wider">{formatCPF(p.cpf)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {selected && (
                        <div className="flex items-center gap-4 mt-3 text-[0.72rem] text-(--muted-foreground)">
                            <span>Matrícula: <strong className="text-(--foreground)">{selected.matricula}</strong></span>
                            <span>CPF: <strong className="text-(--foreground) tracking-wider">{formatCPF(selected.cpf)}</strong></span>
                        </div>
                    )}
                </div>
            </div>

            {searched && (
                <div className="bg-card border border-(--border)">
                    <div className="px-5 py-3 border-b border-(--border) bg-muted flex items-center justify-between">
                        <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">
                            {selected ? toTitleCase(selected.nome) : ''} — {sales.length} compra{sales.length !== 1 ? 's' : ''}
                        </span>
                        {sales.length > 0 && (
                            <button
                                onClick={exportCsv}
                                className="flex items-center gap-1.5 border border-(--border) px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                            >
                                <Download size={11} /> Exportar CSV
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-collapse">
                            <thead>
                                <tr className="bg-muted border-b border-(--border)">
                                    {['Nº Nota', 'Data', 'Filial', 'Valor'].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loadingSales ? (
                                    <tr><td colSpan={4} className="text-center py-10 text-sm text-(--muted-foreground)">Carregando…</td></tr>
                                ) : sales.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-10 text-sm text-(--muted-foreground)">Nenhuma compra encontrada.</td></tr>
                                ) : sales.map(s => (
                                    <tr key={s.id} className="border-b border-(--border) last:border-0 hover:bg-muted transition-colors">
                                        <td className="px-4 py-2.5 text-[0.75rem] font-medium text-(--muted-foreground)">{s.numnota}</td>
                                        <td className="px-4 py-2.5 text-[0.75rem] text-(--muted-foreground)">{s.dtsaida}</td>
                                        <td className="px-4 py-2.5 text-[0.78rem] text-(--foreground)">{s.filial?.filial ?? `Filial ${s.codfilial}`}</td>
                                        <td className="px-4 py-2.5 text-[0.78rem] font-semibold text-(--primary)">{formatMoney(s.vltotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {sales.length > 0 && (
                                <tfoot>
                                    <tr className="border-t border-(--border) bg-muted">
                                        <td colSpan={3} className="px-4 py-2.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground) text-right">Total</td>
                                        <td className="px-4 py-2.5 text-sm font-black text-(--primary)">{formatMoney(total)}</td>
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
