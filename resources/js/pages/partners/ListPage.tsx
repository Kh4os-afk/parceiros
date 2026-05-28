import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Upload, ChevronUp, ChevronDown, Pencil, ReceiptText } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, formatMoney, toTitleCase } from '@/lib/utils'

interface Partner {
    id: number
    nome: string
    cpf: string
    matricula: string
    limcred: number
    bloqueado: number
}

interface Meta {
    current_page: number
    last_page: number
    total: number
    per_page: number
}

type SortField = 'nome' | 'matricula' | 'cpf' | 'limcred' | 'bloqueado'

export default function ListPage() {
    const navigate = useNavigate()
    const [partners, setPartners] = useState<Partner[]>([])
    const [meta, setMeta] = useState<Meta | null>(null)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<SortField>('nome')
    const [order, setOrder] = useState<'asc' | 'desc'>('asc')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchPartners = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/partners', {
                params: { search, sort_by: sortBy, order, page },
            })
            setPartners(res.data.data)
            setMeta(res.data)
        } finally {
            setLoading(false)
        }
    }, [search, sortBy, order, page])

    useEffect(() => { fetchPartners() }, [fetchPartners])
    useEffect(() => { setPage(1) }, [search])

    function toggleSort(field: SortField) {
        if (sortBy === field) setOrder(o => o === 'asc' ? 'desc' : 'asc')
        else { setSortBy(field); setOrder('asc') }
        setPage(1)
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortBy !== field) return null
        return order === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
    }

    const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : []

    return (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Gestão</p>
                    <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">Funcionários</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/importar/csv')}
                        className="flex items-center gap-1.5 border border-(--border) bg-card px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--foreground) hover:border-(--primary) transition-colors"
                    >
                        <Upload size={12} /> Importar CSV
                    </button>
                    <button
                        onClick={() => navigate('/funcionarios/cadastrar')}
                        className="flex items-center gap-1.5 bg-(--primary) text-white px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                        <Plus size={12} /> Cadastrar
                    </button>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-card border border-(--border)">
                {/* Toolbar */}
                <div className="flex gap-2 p-3 border-b border-(--border)">
                    <div className="relative flex-1">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nome, CPF ou matrícula…"
                            className="w-full pl-8 pr-3 py-2 text-sm border border-(--border) bg-muted text-(--foreground) outline-none focus:border-(--primary) placeholder:text-(--muted-foreground) placeholder:opacity-60"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-(--border)">
                                {([
                                    ['matricula', 'Matrícula'],
                                    ['nome', 'Nome'],
                                    ['cpf', 'CPF'],
                                    ['limcred', 'Lim. Crédito'],
                                    ['bloqueado', 'Status'],
                                ] as [SortField, string][]).map(([field, label]) => (
                                    <th
                                        key={field}
                                        onClick={() => toggleSort(field)}
                                        className="px-4 py-2.5 text-left text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground) cursor-pointer select-none hover:text-(--primary) whitespace-nowrap"
                                    >
                                        <span className="flex items-center gap-1">
                                            {label} <SortIcon field={field} />
                                        </span>
                                    </th>
                                ))}
                                <th className="px-4 py-2.5 text-right text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-sm text-(--muted-foreground)">Carregando…</td></tr>
                            ) : partners.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-sm text-(--muted-foreground)">Nenhum resultado encontrado.</td></tr>
                            ) : partners.map(p => (
                                <tr key={p.id} className="border-b border-(--border) last:border-0 hover:bg-muted transition-colors">
                                    <td className="px-4 py-2.5 text-[0.75rem] font-medium text-(--muted-foreground)">{p.matricula}</td>
                                    <td className="px-4 py-2.5 text-sm font-medium text-(--foreground)">{toTitleCase(p.nome)}</td>
                                    <td className="px-4 py-2.5 text-[0.75rem] text-(--muted-foreground) tracking-wider">{formatCPF(p.cpf)}</td>
                                    <td className="px-4 py-2.5 text-[0.78rem] font-semibold text-(--primary)">{formatMoney(p.limcred)}</td>
                                    <td className="px-4 py-2.5">
                                        {p.bloqueado
                                            ? <span className="inline-flex items-center px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">✕ Bloqueado</span>
                                            : <span className="inline-flex items-center px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider bg-green-500/10 text-green-600 border border-green-500/20">● Ativo</span>
                                        }
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="inline-flex gap-1">
                                            <button
                                                onClick={() => navigate(`/funcionarios/${p.id}`)}
                                                title="Ver detalhes"
                                                className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                                            >
                                                <ReceiptText size={11} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/funcionarios/${p.id}/editar`)}
                                                title="Editar"
                                                className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-(--border)">
                        <span className="text-[0.6rem] uppercase tracking-[0.1em] text-(--muted-foreground)">
                            Mostrando {((meta.current_page - 1) * meta.per_page) + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total} registros
                        </span>
                        <div className="flex gap-1">
                            {pages.slice(0, 7).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-7 h-7 text-[0.68rem] font-semibold border transition-colors ${
                                        p === page
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
