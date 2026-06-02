import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Pencil, AlertCircle, Loader2, Copy, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import api from '@/lib/axios'
import { formatCPF, toTitleCase } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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

const T = {
    bg: '#f4f5f8',
    border: '#e8eaef',
    cyan: '#0099cc',
    purple: '#7c3aed',
    green: '#059669',
    amber: '#d97706',
    red: '#dc2626',
}

const rise: any = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}

export default function ErrorsPage() {
    const navigate = useNavigate()
    const [errors, setErrors] = useState<PartnerError[]>([])
    const [meta, setMeta] = useState<Meta | null>(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
    const [deleting, setDeleting] = useState(false)

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
                setErrors(prev => prev.filter(e => e.id !== (confirm as { id: number }).id))
                setMeta(prev => prev ? { ...prev, total: prev.total - 1 } : null)
            }
            setConfirm(null)
        } finally {
            setDeleting(false)
        }
    }

    const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : []

    const confirmMsg =
        confirm === 'all'
            ? 'Todos os registros de erro serão removidos permanentemente.'
            : confirm === 'duplicates'
            ? 'Os registros cujo CPF já existe na base de funcionários serão removidos.'
            : 'Este registro de erro será removido permanentemente.'

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            style={{ background: T.bg }}
            className="-m-4 md:-m-6 p-4 md:p-6 min-h-screen flex flex-col gap-5"
        >
            {/* ── Header ── */}
            <motion.div variants={rise}>
                <div
                    className="rounded-xl overflow-hidden shadow-sm"
                    style={{ background: '#fff', border: `1px solid ${T.border}` }}
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 md:px-7 pt-5 md:pt-6 pb-4 md:pb-5">
                        <div>
                            <p
                                className="text-[0.72rem] uppercase tracking-[0.3em] font-semibold mb-1"
                                style={{ color: T.cyan }}
                            >
                                Importação
                            </p>
                            <h1 className="text-xl font-black tracking-tight text-gray-900">
                                Erros de Importação
                            </h1>
                            {meta && (
                                <p className="text-[0.75rem] text-gray-500 mt-1.5">
                                    <strong
                                        className="font-black"
                                        style={{ color: meta.total > 0 ? T.amber : T.green }}
                                    >
                                        {meta.total}
                                    </strong>{' '}
                                    registro{meta.total !== 1 ? 's' : ''} aguardando revisão
                                </p>
                            )}
                        </div>

                        {meta && meta.total > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirm('duplicates')}
                                    className="text-[0.7rem] font-bold uppercase tracking-wider gap-1.5"
                                    style={{
                                        borderColor: `${T.amber}50`,
                                        color: T.amber,
                                        background: `${T.amber}10`,
                                    }}
                                >
                                    <Copy size={12} /> Remover Duplicatas
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirm('all')}
                                    className="text-[0.7rem] font-bold uppercase tracking-wider gap-1.5"
                                    style={{
                                        borderColor: `${T.red}50`,
                                        color: T.red,
                                        background: `${T.red}10`,
                                    }}
                                >
                                    <Trash2 size={12} /> Limpar Todos
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ── Empty state ── */}
            <AnimatePresence>
                {!loading && errors.length === 0 && (
                    <motion.div
                        key="empty"
                        variants={rise}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <div
                            className="rounded-xl p-10 flex flex-col items-center gap-4 shadow-sm"
                            style={{ background: '#fff', border: `1px solid ${T.border}` }}
                        >
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{ background: `${T.green}15`, border: `1px solid ${T.green}30` }}
                            >
                                <CheckCircle2 size={26} style={{ color: T.green }} />
                            </div>
                            <div className="text-center">
                                <p className="text-[0.9rem] font-black text-gray-900">Nenhum erro pendente</p>
                                <p className="text-[0.72rem] text-gray-400 mt-1">
                                    Todos os registros foram processados com sucesso.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Tabela ── */}
            {(loading || errors.length > 0) && (
                <motion.div variants={rise}>
                    <div
                        className="rounded-xl overflow-hidden shadow-sm"
                        style={{ background: '#fff', border: `1px solid ${T.border}` }}
                    >
                        {/* Table header bar */}
                        <div
                            className="px-6 py-3.5 flex items-center justify-between"
                            style={{ borderBottom: `1px solid ${T.border}`, background: '#f9fafb' }}
                        >
                            <span className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-gray-400">
                                Registros com Falha
                            </span>
                            {meta && meta.total > 0 && (
                                <span
                                    className="text-[0.7rem] uppercase tracking-[0.15em] font-black"
                                    style={{ color: T.amber }}
                                >
                                    {meta.total} pendente{meta.total !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max border-collapse">
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${T.border}`, background: '#f9fafb' }}>
                                        {['Matrícula', 'Nome', 'CPF', 'Motivo do Erro'].map(h => (
                                            <th
                                                key={h}
                                                className="px-5 py-3 text-left text-[0.7rem] font-black uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                        <th className="px-5 py-3 text-right text-[0.7rem] font-black uppercase tracking-[0.2em] text-gray-400">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-14">
                                                <Loader2 size={20} className="animate-spin mx-auto text-gray-300" />
                                            </td>
                                        </tr>
                                    ) : (
                                        errors.map((err, idx) => (
                                            <motion.tr
                                                key={err.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                className="group transition-colors"
                                                style={{ borderBottom: `1px solid ${T.border}` }}
                                                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <td className="px-5 py-3">
                                                    <span className="text-[0.68rem] font-mono text-gray-400">
                                                        {err.matricula || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="text-[0.78rem] font-bold text-gray-800">
                                                        {toTitleCase(err.nome)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="text-[0.74rem] font-mono font-semibold text-gray-500 tracking-wider">
                                                        {formatCPF(err.cpf)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 max-w-xs">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle size={11} className="shrink-0 mt-0.5" style={{ color: T.amber }} />
                                                        <span
                                                            className="text-[0.72rem] font-semibold leading-snug"
                                                            style={{ color: T.amber }}
                                                        >
                                                            {err.erros}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="inline-flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => navigate(`/importar/erros/${err.id}/editar`)}
                                                            title="Editar e aprovar"
                                                            className="inline-flex items-center justify-center w-7 h-7 rounded transition-colors"
                                                            style={{
                                                                border: `1px solid ${T.border}`,
                                                                color: '#9ca3af',
                                                            }}
                                                            onMouseEnter={e => {
                                                                e.currentTarget.style.borderColor = T.cyan
                                                                e.currentTarget.style.color = T.cyan
                                                            }}
                                                            onMouseLeave={e => {
                                                                e.currentTarget.style.borderColor = T.border
                                                                e.currentTarget.style.color = '#9ca3af'
                                                            }}
                                                        >
                                                            <Pencil size={11} />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirm({ id: err.id })}
                                                            title="Remover"
                                                            className="inline-flex items-center justify-center w-7 h-7 rounded transition-colors"
                                                            style={{
                                                                border: `1px solid ${T.border}`,
                                                                color: '#9ca3af',
                                                            }}
                                                            onMouseEnter={e => {
                                                                e.currentTarget.style.borderColor = `${T.red}60`
                                                                e.currentTarget.style.color = T.red
                                                            }}
                                                            onMouseLeave={e => {
                                                                e.currentTarget.style.borderColor = T.border
                                                                e.currentTarget.style.color = '#9ca3af'
                                                            }}
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {meta && meta.last_page > 1 && (
                            <div
                                className="flex items-center justify-between px-5 py-3"
                                style={{ borderTop: `1px solid ${T.border}`, background: '#f9fafb' }}
                            >
                                <span className="text-[0.65rem] uppercase tracking-[0.18em] text-gray-400">
                                    {((meta.current_page - 1) * meta.per_page) + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total}
                                </span>
                                <div className="flex gap-1">
                                    {pages.slice(0, 7).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className="w-7 h-7 rounded text-[0.62rem] font-bold transition-all"
                                            style={
                                                p === page
                                                    ? {
                                                          background: `linear-gradient(135deg, ${T.cyan}, ${T.purple})`,
                                                          color: '#fff',
                                                          border: 'none',
                                                      }
                                                    : {
                                                          border: `1px solid ${T.border}`,
                                                          color: '#9ca3af',
                                                          background: 'transparent',
                                                      }
                                            }
                                            onMouseEnter={e => {
                                                if (p !== page) {
                                                    e.currentTarget.style.borderColor = T.cyan
                                                    e.currentTarget.style.color = T.cyan
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (p !== page) {
                                                    e.currentTarget.style.borderColor = T.border
                                                    e.currentTarget.style.color = '#9ca3af'
                                                }
                                            }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* ── Modal de confirmação ── */}
            <AnimatePresence>
                {confirm && (
                    <motion.div
                        key="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                    >
                        <motion.div
                            key="modal-card"
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-sm mx-4 rounded-xl overflow-hidden shadow-2xl"
                            style={{ background: '#fff', border: `1px solid ${T.border}` }}
                        >
                            {/* Faixa vermelha topo */}
                            <div style={{ height: 3, background: T.red }} />

                            <div className="p-6 flex flex-col gap-5">
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: `${T.red}12`, border: `1px solid ${T.red}25` }}
                                    >
                                        <Trash2 size={16} style={{ color: T.red }} />
                                    </div>
                                    <div>
                                        <p className="text-[0.75rem] font-black uppercase tracking-[0.12em] text-gray-900 mb-1.5">
                                            Confirmar exclusão
                                        </p>
                                        <p className="text-[0.72rem] text-gray-500 leading-relaxed">
                                            {confirmMsg}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="flex justify-end gap-2 pt-3"
                                    style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setConfirm(null)}
                                        disabled={deleting}
                                        className="text-[0.68rem] font-bold uppercase tracking-wider"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={executeDelete}
                                        disabled={deleting}
                                        className="text-[0.68rem] font-bold uppercase tracking-wider gap-1.5"
                                        style={{ background: T.red, color: '#fff', border: 'none' }}
                                    >
                                        {deleting && <Loader2 size={11} className="animate-spin" />}
                                        Confirmar Exclusão
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
