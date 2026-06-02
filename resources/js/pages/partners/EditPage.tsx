import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import api from '@/lib/axios'
import { formatCPF, formatMoneyInput, maskMoney, parseMoney, toTitleCase } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface Errors { [key: string]: string[] }

const T = { bg: '#f4f5f8', border: '#e8eaef', cyan: '#0099cc', purple: '#7c3aed', green: '#059669', amber: '#d97706', red: '#dc2626' }
const cardStyle = { background: '#ffffff', border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger = (d = 0): any => ({ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: d } } })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rise: any = { hidden: { opacity: 0, y: 20, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

export default function EditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState({ nome: '', cpf: '', matricula: '', limcred: '', bloqueado: '0' })
    const [errors, setErrors] = useState<Errors>({})
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        api.get(`/partners/${id}`)
            .then(res => {
                const p = res.data
                setForm({
                    nome: toTitleCase(p.nome),
                    cpf: formatCPF(p.cpf),
                    matricula: p.matricula != null ? String(p.matricula) : '',
                    limcred: formatMoneyInput(p.limcred),
                    bloqueado: String(p.bloqueado),
                })
            })
            .finally(() => setFetching(false))
    }, [id])

    function set(field: string, value: string) {
        setForm(f => ({ ...f, [field]: value }))
        setErrors(e => ({ ...e, [field]: [] }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        try {
            await api.put(`/partners/${id}`, {
                nome: form.nome,
                matricula: form.matricula || null,
                limcred: parseMoney(form.limcred),
                bloqueado: form.bloqueado,
            })
            navigate('/funcionarios')
        } catch (err: any) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger(0)}
                className="flex flex-col gap-4"
                style={{ background: T.bg, minHeight: '100%' }}
            >
                <motion.div variants={rise} className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-56" />
                </motion.div>
                <motion.div variants={rise} style={cardStyle} className="rounded-none">
                    <div className="px-5 py-3 border-b" style={{ borderColor: T.border, background: '#f9fafb' }}>
                        <Skeleton className="h-3 w-40" />
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 flex flex-col gap-1.5">
                                <Skeleton className="h-2.5 w-24" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-2.5 w-16" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-2.5 w-12" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-2.5 w-32" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-2.5 w-12" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t mt-1" style={{ borderColor: T.border }}>
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-36" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger(0)}
            className="flex flex-col gap-4"
            style={{ background: T.bg, minHeight: '100%' }}
        >
            <motion.div variants={rise}>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] mb-0.5" style={{ color: '#94a3b8' }}>Cadastros</p>
                <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: '#0f172a' }}>
                    {form.nome ? `Editar — ${form.nome}` : 'Editar Funcionário'}
                </h1>
            </motion.div>

            <motion.div variants={rise} style={cardStyle}>
                <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: T.border, background: '#f9fafb' }}>
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em]" style={{ color: '#0f172a' }}>Dados do Funcionário</span>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4" autoComplete="off">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em]" style={{ color: '#64748b' }}>Nome Completo</label>
                            <Input
                                value={form.nome}
                                onChange={e => set('nome', e.target.value)}
                                style={errors.nome ? { borderColor: T.red } : {}}
                                className={errors.nome ? 'border-[#dc2626]' : ''}
                            />
                            {errors.nome?.[0] && <p className="text-[0.68rem]" style={{ color: T.red }}>{errors.nome[0]}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em]" style={{ color: '#64748b' }}>
                                Matrícula <span className="font-normal normal-case tracking-normal">(opcional)</span>
                            </label>
                            <Input
                                value={form.matricula}
                                onChange={e => set('matricula', e.target.value)}
                                className={errors.matricula ? 'tracking-wider' : 'tracking-wider'}
                                style={errors.matricula ? { borderColor: T.red } : {}}
                            />
                            {errors.matricula?.[0] && <p className="text-[0.68rem]" style={{ color: T.red }}>{errors.matricula[0]}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em]" style={{ color: '#64748b' }}>CPF</label>
                            <Input
                                value={form.cpf}
                                disabled
                                className="tracking-widest cursor-not-allowed opacity-50"
                            />
                            <p className="text-[0.58rem]" style={{ color: '#94a3b8' }}>CPF não pode ser alterado</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em]" style={{ color: '#64748b' }}>Limite de Crédito (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.72rem] pointer-events-none" style={{ color: '#94a3b8' }}>R$</span>
                                <Input
                                    value={form.limcred}
                                    onChange={e => set('limcred', maskMoney(e.target.value))}
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    className="pl-9"
                                    style={errors.limcred ? { borderColor: T.red } : {}}
                                />
                            </div>
                            {errors.limcred?.[0] && <p className="text-[0.68rem]" style={{ color: T.red }}>{errors.limcred[0]}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em]" style={{ color: '#64748b' }}>Status</label>
                            <select
                                value={form.bloqueado}
                                onChange={e => set('bloqueado', e.target.value)}
                                className="px-3 py-2 text-sm outline-none cursor-pointer h-9 border"
                                style={{
                                    borderColor: form.bloqueado === '1' ? T.red : T.border,
                                    background: '#f9fafb',
                                    color: form.bloqueado === '1' ? T.red : '#0f172a',
                                }}
                            >
                                <option value="0">Ativo</option>
                                <option value="1">Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t mt-1" style={{ borderColor: T.border }}>
                        <button
                            type="button"
                            onClick={() => navigate('/funcionarios')}
                            className="px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider transition-colors border"
                            style={{ borderColor: T.border, color: '#64748b', background: 'transparent' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-1.5 px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider transition-opacity disabled:opacity-60 hover:opacity-90"
                            style={{ background: T.amber, color: '#ffffff' }}
                        >
                            {loading && <Loader2 size={12} className="animate-spin" />}
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}
