import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Pencil, AlertCircle, Loader2, Copy, CheckCircle2 } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, toTitleCase } from '@/lib/utils'

interface PartnerError {
    id: number
    nome: string
    cpf: string
    matricula: string
    limcred: number | string
    bloqueado: number
    erros: string
}

interface Meta {
    current_page: number
    last_page: number
    total: number
    per_page: number
}

type ConfirmAction = 'all' | 'duplicates' | { id: number }

const corners = [
    'top-0 left-0 border-t-2 border-l-2',
    'top-0 right-0 border-t-2 border-r-2',
    'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-0 right-0 border-b-2 border-r-2',
]

export default function ErrorsPage() {
    const navigate = useNavigate()
    const [errors,  setErrors]  = useState<PartnerError[]>([])
    const [meta,    setMeta]    = useState<Meta | null>(null)
    const [page,    setPage]    = useState(1)
    const [loading, setLoading] = useState(true)
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
    const [deleting,setDeleting]= useState(false)

    const fetchErrors = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        try {
            const res = await api.get('/partner-errors', { params: { page } })
            setErrors(res.data.data)
            setMeta(res.data)
        } finally {
            if (!silent) setLoading(false)
        }
    }, [page])

    useEffect(() => { fetchErrors() }, [fetchErrors])

    async function executeDelete() {
        if (!confirm) return
        setDeleting(true)
        try {
            if (confirm === 'all') {
                await api.delete('/partner-errors/all')
                setErrors([])
                setMeta(null)
            } else if (confirm === 'duplicates') {
                await api.delete('/partner-errors/duplicates')
                fetchErrors(true)
            } else {
                await api.delete(`/partner-errors/${confirm.id}`)
                setErrors(prev => prev.filter(e => e.id !== confirm.id))
                setMeta(prev => prev ? { ...prev, total: prev.total - 1 } : null)
            }
            setConfirm(null)
        } finally {
            setDeleting(false)
        }
    }

    const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : []

    const confirmMsg = confirm === 'all'
        ? 'Todos os registros de erro serão removidos permanentemente.'
        : confirm === 'duplicates'
        ? 'Os registros cujo CPF já existe na base de funcionários serão removidos.'
        : 'Este registro de erro será removido permanentemente.'

    return (
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">

            {/* ── Header ── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 6%, transparent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {corners.map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 border-(--primary)/30 ${cls}`} />
                ))}

                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 md:px-7 pt-5 md:pt-6 pb-4 md:pb-5">
                    <div>
                        <p className="text-[0.5rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Importação</p>
                        <h1 className="text-xl font-black uppercase tracking-[0.08em] text-(--foreground)">Erros de Importação</h1>
                        {meta && (
                            <p className="text-[0.58rem] text-(--muted-foreground) mt-1.5">
                                <strong className={`font-black ${meta.total > 0 ? 'text-amber-500' : 'text-green-600'}`}>
                                    {meta.total}
                                </strong>
                                {' '}registro{meta.total !== 1 ? 's' : ''} aguardando revisão
                            </p>
                        )}
                    </div>

                    {meta && meta.total > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirm('duplicates')}
                                className="flex items-center gap-1.5 border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] text-amber-500 hover:bg-amber-500/20 transition-colors"
                            >
                                <Copy size={11} /> Remover Duplicatas
                            </button>
                            <button
                                onClick={() => setConfirm('all')}
                                className="flex items-center gap-1.5 border border-red-500/25 bg-red-500/10 px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 size={11} /> Limpar Todos
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tabela ── */}
            <div className="bg-card border border-(--border)">
                <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center justify-between">
                    <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                        Registros com Falha
                    </span>
                    {meta && meta.total > 0 && (
                        <span className="text-[0.52rem] uppercase tracking-[0.15em] text-amber-500 font-black">
                            {meta.total} pendente{meta.total !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-max border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-(--border)">
                                {['Matrícula', 'Nome', 'CPF', 'Motivo do Erro'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground) whitespace-nowrap">
                                        {h}
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
                                    <td colSpan={5} className="text-center py-14 text-[0.75rem] text-(--muted-foreground)">
                                        Carregando…
                                    </td>
                                </tr>
                            ) : errors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                                <CheckCircle2 size={20} className="text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-[0.82rem] font-black text-(--foreground)">Nenhum erro pendente</p>
                                                <p className="text-[0.65rem] text-(--muted-foreground) mt-0.5">Todos os registros foram processados com sucesso.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : errors.map(err => (
                                <tr
                                    key={err.id}
                                    className="group border-b border-(--border) last:border-0 hover:bg-muted transition-colors"
                                >
                                    <td className="px-5 py-3">
                                        <span className="text-[0.68rem] font-mono text-(--muted-foreground)">
                                            {err.matricula || '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.78rem] font-semibold text-(--foreground) group-hover:text-(--primary) transition-colors">
                                            {toTitleCase(err.nome)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.68rem] font-mono text-(--muted-foreground) tracking-wider">
                                            {formatCPF(err.cpf)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 max-w-xs">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                                            <span className="text-[0.65rem] text-amber-500 leading-snug">{err.erros}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="inline-flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/importar/erros/${err.id}/editar`)}
                                                className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                                                title="Editar e aprovar"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                            <button
                                                onClick={() => setConfirm({ id: err.id })}
                                                className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-red-500 hover:border-red-500/40 transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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

            {/* ── Modal de confirmação ── */}
            {confirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative bg-card border border-(--border) shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                        {/* Faixa vermelha topo */}
                        <div className="h-0.5 bg-red-500 w-full" />
                        <div className="p-6 flex flex-col gap-5">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                    <Trash2 size={15} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-[0.72rem] font-black uppercase tracking-[0.15em] text-(--foreground) mb-1.5">
                                        Confirmar exclusão
                                    </p>
                                    <p className="text-[0.68rem] text-(--muted-foreground) leading-relaxed">
                                        {confirmMsg}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-1 border-t border-(--border)">
                                <button
                                    onClick={() => setConfirm(null)}
                                    disabled={deleting}
                                    className="border border-(--border) px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={executeDelete}
                                    disabled={deleting}
                                    className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] hover:opacity-90 disabled:opacity-60 transition-opacity"
                                >
                                    {deleting && <Loader2 size={11} className="animate-spin" />}
                                    Confirmar Exclusão
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
