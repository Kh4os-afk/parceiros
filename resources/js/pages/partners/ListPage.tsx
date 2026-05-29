import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search, Plus, Upload, ChevronUp, ChevronDown,
    Pencil, ReceiptText, Users, ShieldOff, ShieldCheck, CreditCard,
} from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, formatMoney, toTitleCase } from '@/lib/utils'
import CountUp from '@/components/CountUp'

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

const corners = [
    'top-0 left-0 border-t-2 border-l-2',
    'top-0 right-0 border-t-2 border-r-2',
    'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-0 right-0 border-b-2 border-r-2',
]

export default function ListPage() {
    const navigate = useNavigate()
    const [partners,  setPartners]  = useState<Partner[]>([])
    const [meta,      setMeta]      = useState<Meta | null>(null)
    const [search,    setSearch]    = useState('')
    const [sortBy,    setSortBy]    = useState<SortField>('nome')
    const [order,     setOrder]     = useState<'asc' | 'desc'>('asc')
    const [page,      setPage]      = useState(1)
    const [loading,   setLoading]   = useState(true)
    const [summary,   setSummary]   = useState({ total: 0, ativos: 0, bloqueados: 0, lim_medio: 0, lim_total: 0 })

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

    useEffect(() => {
        api.get('/partners/summary', { params: { search: search || undefined } })
            .then(r => setSummary(r.data))
            .catch(() => {})
    }, [search])

    function toggleSort(field: SortField) {
        if (sortBy === field) setOrder(o => o === 'asc' ? 'desc' : 'asc')
        else { setSortBy(field); setOrder('asc') }
        setPage(1)
    }

    const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : []

    return (
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">

            {/* ── Header ── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">
                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 6%, transparent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {corners.map((cls, i) => (
                    <div key={i} className={`absolute z-10 w-5 h-5 border-(--primary)/30 ${cls}`} />
                ))}

                {/* Título + ações */}
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 md:px-7 pt-5 md:pt-6 pb-4 md:pb-5">
                    <div>
                        <p className="text-[0.5rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Gestão</p>
                        <h1 className="text-xl font-black uppercase tracking-[0.08em] text-(--foreground)">Funcionários</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/importar/csv')}
                            className="flex items-center gap-1.5 border border-(--border) bg-card px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                        >
                            <Upload size={11} /> Importar CSV
                        </button>
                        <button
                            onClick={() => navigate('/funcionarios/cadastrar')}
                            className="flex items-center gap-1.5 bg-(--primary) text-white px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
                        >
                            <Plus size={11} /> Cadastrar
                        </button>
                    </div>
                </div>

                {/* Strip de KPIs */}
                <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-t border-(--border)">
                    {[
                        {
                            label: 'Total Cadastrados',
                            value: summary.total,
                            sub:   'na base',
                            icon:  Users,
                            color: 'default' as const,
                        },
                        {
                            label: 'Ativos',
                            value: summary.ativos,
                            sub:   'no total',
                            icon:  ShieldCheck,
                            color: 'green' as const,
                        },
                        {
                            label: 'Bloqueados',
                            value: summary.bloqueados,
                            sub:   'no total',
                            icon:  ShieldOff,
                            color: summary.bloqueados > 0 ? 'red' as const : 'default' as const,
                        },
                        {
                            label: 'Lim. Médio Mensal',
                            value: summary.lim_medio,
                            sub:   'média geral',
                            icon:  CreditCard,
                            color: 'primary' as const,
                            money: true,
                        },
                        {
                            label: 'Total em Crédito',
                            value: summary.lim_total,
                            sub:   'soma de todos',
                            icon:  CreditCard,
                            color: 'primary' as const,
                            money: true,
                        },
                    ].map(({ label, value, sub, icon: Icon, color, money }) => (
                        <div key={label} className="group relative px-4 md:px-6 py-3.5 border-r border-b border-(--border) bg-muted hover:bg-card cursor-default transition-colors duration-150 overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                                color === 'green' ? 'bg-green-500' : color === 'red' ? 'bg-red-500' : 'bg-(--primary)'
                            }`} />
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <Icon size={9} className={`
                                    ${color === 'green'   ? 'text-green-500'      :
                                      color === 'red'     ? 'text-red-500'        :
                                      color === 'primary' ? 'text-(--primary)'    :
                                      'text-(--muted-foreground) opacity-50'}
                                `} />
                                <p className="text-[0.44rem] uppercase tracking-[0.2em] text-(--muted-foreground)">{label}</p>
                            </div>
                            <p className={`text-lg font-black tabular-nums leading-none transition-colors ${
                                color === 'green'   ? 'text-green-600 group-hover:text-green-500' :
                                color === 'red'     ? 'text-red-500'                              :
                                color === 'primary' ? 'text-(--primary)'                          :
                                'text-(--foreground) group-hover:text-(--primary)'
                            }`}>
                                {money && <span className="text-[0.45em] font-bold opacity-50 mr-0.5">R$</span>}
                                <CountUp
                                    value={value}
                                    decimals={money ? 2 : 0}
                                    duration={2.4}
                                />
                            </p>
                            <p className="text-[0.43rem] text-(--muted-foreground) mt-1 uppercase tracking-[0.12em]">{sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tabela ── */}
            <div className="bg-card border border-(--border)">

                {/* Barra de busca */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-(--border) bg-muted">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nome, CPF ou matrícula…"
                            className="w-full pl-8 pr-3 py-2 text-[0.72rem] border border-(--border) bg-card text-(--foreground) outline-none focus:border-(--primary) placeholder:text-(--muted-foreground) placeholder:opacity-50 transition-colors"
                        />
                    </div>
                    {meta && (
                        <span className="text-[0.5rem] uppercase tracking-[0.18em] text-(--muted-foreground) ml-auto">
                            {meta.total} registro{meta.total !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-(--border)">
                                {([
                                    ['matricula', 'Matrícula'],
                                    ['nome',      'Nome'],
                                    ['cpf',       'CPF'],
                                    ['limcred',   'Lim. Mensal'],
                                    ['bloqueado', 'Status'],
                                ] as [SortField, string][]).map(([field, label]) => (
                                    <th
                                        key={field}
                                        onClick={() => toggleSort(field)}
                                        className="px-5 py-3 text-left select-none cursor-pointer whitespace-nowrap group"
                                    >
                                        <span className={`flex items-center gap-1 text-[0.5rem] font-black uppercase tracking-[0.2em] transition-colors ${sortBy === field ? 'text-(--primary)' : 'text-(--muted-foreground) group-hover:text-(--primary)'}`}>
                                            {label}
                                            {sortBy === field
                                                ? order === 'asc' ? <ChevronUp size={9} /> : <ChevronDown size={9} />
                                                : <ChevronUp size={9} className="opacity-0 group-hover:opacity-30" />
                                            }
                                        </span>
                                    </th>
                                ))}
                                <th className="px-5 py-3 text-right text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-14 text-[0.75rem] text-(--muted-foreground)">
                                        Carregando…
                                    </td>
                                </tr>
                            ) : partners.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-14">
                                        <p className="text-[0.8rem] font-semibold text-(--muted-foreground)">
                                            {search ? `Nenhum resultado para "${search}"` : 'Nenhum funcionário cadastrado.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : partners.map(p => (
                                <tr
                                    key={p.id}
                                    className="group border-b border-(--border) last:border-0 hover:bg-muted transition-colors cursor-default"
                                >
                                    {/* Indicador lateral de status */}
                                    <td className="px-5 py-3 relative">
                                        <div className={`absolute left-0 top-2 bottom-2 w-0.5 transition-opacity ${p.bloqueado ? 'bg-red-500 opacity-60' : 'bg-(--primary) opacity-0 group-hover:opacity-40'}`} />
                                        <span className="text-[0.68rem] font-mono text-(--muted-foreground) tabular-nums">
                                            {p.matricula || '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.8rem] font-semibold text-(--foreground) group-hover:text-(--primary) transition-colors">
                                            {toTitleCase(p.nome)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.68rem] font-mono text-(--muted-foreground) tracking-wider">
                                            {formatCPF(p.cpf)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.75rem] font-black text-(--primary) tabular-nums">
                                            {formatMoney(p.limcred)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {p.bloqueado
                                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.15em] bg-red-500/10 text-red-500 border border-red-500/20">
                                                <ShieldOff size={8} /> Bloqueado
                                              </span>
                                            : <span className="inline-flex items-center gap-1.5 text-[0.5rem] font-black uppercase tracking-[0.15em] text-green-600">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Ativo
                                              </span>
                                        }
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="inline-flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
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

                {/* Paginação */}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-(--border) bg-muted">
                        <span className="text-[0.5rem] uppercase tracking-[0.18em] text-(--muted-foreground)">
                            {((meta.current_page - 1) * meta.per_page) + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total}
                        </span>
                        <div className="flex gap-1">
                            {pages.slice(0, 7).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-7 h-7 text-[0.6rem] font-black border transition-all ${
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
