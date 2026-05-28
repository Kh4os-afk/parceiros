import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Pencil, AlertCircle, Loader2 } from 'lucide-react'
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

export default function ErrorsPage() {
    const navigate = useNavigate()
    const [errors, setErrors] = useState<PartnerError[]>([])
    const [meta, setMeta] = useState<Meta | null>(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchErrors = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/partner-errors', { params: { page } })
            setErrors(res.data.data)
            setMeta(res.data)
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => { fetchErrors() }, [fetchErrors])

    async function executeDelete() {
        if (!confirm) return
        setDeleting(true)
        try {
            if (confirm === 'all') await api.delete('/partner-errors/all')
            else if (confirm === 'duplicates') await api.delete('/partner-errors/duplicates')
            else await api.delete(`/partner-errors/${confirm.id}`)
            setConfirm(null)
            setPage(1)
            fetchErrors()
        } finally {
            setDeleting(false)
        }
    }

    const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : []

    return (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-0.5">Importação</p>
                    <h1 className="text-xl font-black uppercase tracking-widest text-[var(--foreground)]">Erros de Importação</h1>
                </div>
                {meta && meta.total > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setConfirm('duplicates')}
                            className="border border-amber-300 bg-amber-50 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                            Remover Duplicatas
                        </button>
                        <button
                            onClick={() => setConfirm('all')}
                            className="border border-red-200 bg-red-50 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-colors"
                        >
                            <Trash2 size={12} className="inline mr-1.5" />
                            Limpar Todos
                        </button>
                    </div>
                )}
            </div>

            {/* Confirm dialog */}
            {confirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white border border-[var(--border)] shadow-lg w-full max-w-sm p-6 flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-[var(--foreground)]">Confirmar exclusão</p>
                                <p className="text-[0.78rem] text-[var(--muted-foreground)] mt-1">
                                    {confirm === 'all'
                                        ? 'Todos os registros de erro serão removidos permanentemente.'
                                        : confirm === 'duplicates'
                                        ? 'Os registros cujo CPF já existe na base de funcionários serão removidos.'
                                        : 'Este registro de erro será removido permanentemente.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirm(null)}
                                disabled={deleting}
                                className="border border-[var(--border)] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executeDelete}
                                disabled={deleting}
                                className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity"
                            >
                                {deleting && <Loader2 size={12} className="animate-spin" />}
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-[var(--border)]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[oklch(0.97_0_0)] border-b border-[var(--border)]">
                                {['Matrícula', 'Nome', 'CPF', 'Motivo'].map(h => (
                                    <th key={h} className="px-4 py-2.5 text-left text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)] whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                                <th className="px-4 py-2.5 text-right text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-10 text-sm text-[var(--muted-foreground)]">Carregando…</td></tr>
                            ) : errors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-14">
                                        <p className="text-sm font-medium text-[var(--foreground)]">Nenhum erro de importação</p>
                                        <p className="text-[0.72rem] text-[var(--muted-foreground)] mt-1">Todos os registros foram processados com sucesso.</p>
                                    </td>
                                </tr>
                            ) : errors.map(err => (
                                <tr key={err.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[oklch(0.97_0_0)] transition-colors">
                                    <td className="px-4 py-2.5 text-[0.75rem] font-medium text-[var(--muted-foreground)]">{err.matricula}</td>
                                    <td className="px-4 py-2.5 text-sm font-medium text-[var(--foreground)]">{toTitleCase(err.nome)}</td>
                                    <td className="px-4 py-2.5 text-[0.75rem] text-[var(--muted-foreground)] tracking-wider">{formatCPF(err.cpf)}</td>
                                    <td className="px-4 py-2.5 text-[0.72rem] text-amber-700 max-w-xs">{err.erros}</td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="inline-flex gap-1">
                                            <button
                                                onClick={() => navigate(`/importar/erros/${err.id}/editar`)}
                                                className="inline-flex items-center justify-center w-7 h-7 border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
                                                title="Editar e aprovar"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                            <button
                                                onClick={() => setConfirm({ id: err.id })}
                                                className="inline-flex items-center justify-center w-7 h-7 border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-600 hover:border-red-300 transition-colors"
                                                title="Remover erro"
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
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
                        <span className="text-[0.6rem] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                            Mostrando {((meta.current_page - 1) * meta.per_page) + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total} registros
                        </span>
                        <div className="flex gap-1">
                            {pages.slice(0, 7).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-7 h-7 text-[0.68rem] font-semibold border transition-colors ${
                                        p === page
                                            ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                                            : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
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
