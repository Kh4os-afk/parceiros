import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Users, ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import api from '@/lib/axios'
import { maskCPF, maskMoney, parseMoney, stripCPF } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Errors { [key: string]: string[] }

const T = { bg: "#f4f5f8", border: "#e8eaef", cyan: "#0099cc", purple: "#7c3aed", green: "#059669", amber: "#d97706", red: "#dc2626" }
const cardStyle = { background: "#ffffff", border: `1px solid ${T.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger = (d = 0): any => ({ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: d } } })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rise: any = { hidden: { opacity: 0, y: 20, filter: "blur(8px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

export default function CreatePage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [form, setForm] = useState({ nome: '', cpf: '', matricula: '', limcred: '', bloqueado: '0' })
    const [errors, setErrors] = useState<Errors>({})
    const [loading, setLoading] = useState(false)

    function set(field: string, value: string) {
        setForm(f => ({ ...f, [field]: value }))
        setErrors(e => ({ ...e, [field]: [] }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        try {
            await api.post('/partners', {
                nome: form.nome,
                cpf: stripCPF(form.cpf),
                matricula: form.matricula.trim() ? Number(form.matricula) : null,
                limcred: parseMoney(form.limcred),
                bloqueado: form.bloqueado,
            })
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['partners'] }),
                queryClient.invalidateQueries({ queryKey: ['partners-summary'] }),
            ])
            navigate('/funcionarios')
        } catch (err: any) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
        } finally {
            setLoading(false)
        }
    }

    function fieldError(field: string) {
        return errors[field]?.[0]
    }

    return (
        <motion.div
            className="-m-4 md:-m-6 p-4 md:p-6 min-h-screen"
            style={{ background: T.bg }}
            variants={stagger(0.04)}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={rise} className="flex items-center gap-3 mb-6">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/funcionarios')}
                    className="rounded-none h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft size={16} />
                </Button>
                <div>
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-muted-foreground mb-0.5">Gestão</p>
                    <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: "#1a1d23" }}>
                        Cadastrar Funcionário
                    </h1>
                </div>
            </motion.div>

            {/* Form Card */}
            <motion.div variants={rise} style={cardStyle} className="rounded-none">
                {/* Card Header */}
                <div
                    className="flex items-center gap-2.5 px-5 py-3.5 border-b"
                    style={{ borderColor: T.border, background: "#fafbfc" }}
                >
                    <div
                        className="flex items-center justify-center w-7 h-7"
                        style={{ background: `${T.cyan}15`, border: `1px solid ${T.cyan}30` }}
                    >
                        <Users size={14} style={{ color: T.cyan }} />
                    </div>
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em]" style={{ color: "#1a1d23" }}>
                        Dados do Funcionário
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5" autoComplete="off">
                    {/* Row 1: Nome (2 cols) + Matrícula (1 col) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                Nome Completo
                            </label>
                            <input
                                value={form.nome}
                                onChange={e => set('nome', e.target.value)}
                                placeholder="Antonio da Silva"
                                className="border px-3 py-2 text-sm outline-none bg-white w-full transition-colors"
                                style={{
                                    borderColor: fieldError('nome') ? T.red : T.border,
                                    color: "#1a1d23",
                                }}
                                onFocus={e => { if (!fieldError('nome')) e.currentTarget.style.borderColor = T.cyan }}
                                onBlur={e => { if (!fieldError('nome')) e.currentTarget.style.borderColor = T.border }}
                            />
                            {fieldError('nome') && (
                                <p className="text-[0.62rem] mt-1" style={{ color: T.red }}>{fieldError('nome')}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                Matrícula{' '}
                                <span className="font-normal normal-case tracking-normal opacity-60">(opcional)</span>
                            </label>
                            <input
                                value={form.matricula}
                                onChange={e => set('matricula', e.target.value)}
                                placeholder="00142"
                                className="border px-3 py-2 text-sm outline-none bg-white w-full tracking-wider transition-colors"
                                style={{
                                    borderColor: fieldError('matricula') ? T.red : T.border,
                                    color: "#1a1d23",
                                }}
                                onFocus={e => { if (!fieldError('matricula')) e.currentTarget.style.borderColor = T.cyan }}
                                onBlur={e => { if (!fieldError('matricula')) e.currentTarget.style.borderColor = T.border }}
                            />
                            {fieldError('matricula') && (
                                <p className="text-[0.62rem] mt-1" style={{ color: T.red }}>{fieldError('matricula')}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 2: CPF (1 col) + Limite (1 col) + Status (1 col) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                CPF
                            </label>
                            <input
                                value={form.cpf}
                                onChange={e => set('cpf', maskCPF(e.target.value))}
                                placeholder="000.000.000-00"
                                inputMode="numeric"
                                maxLength={14}
                                className="border px-3 py-2 text-sm outline-none bg-white w-full tracking-widest transition-colors"
                                style={{
                                    borderColor: fieldError('cpf') ? T.red : T.border,
                                    color: "#1a1d23",
                                }}
                                onFocus={e => { if (!fieldError('cpf')) e.currentTarget.style.borderColor = T.cyan }}
                                onBlur={e => { if (!fieldError('cpf')) e.currentTarget.style.borderColor = T.border }}
                            />
                            {fieldError('cpf') && (
                                <p className="text-[0.62rem] mt-1" style={{ color: T.red }}>{fieldError('cpf')}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                Limite de Crédito (R$)
                            </label>
                            <div className="relative">
                                <span
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.72rem] pointer-events-none select-none"
                                    style={{ color: "#94a3b8" }}
                                >
                                    R$
                                </span>
                                <input
                                    value={form.limcred}
                                    onChange={e => set('limcred', maskMoney(e.target.value))}
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    className="border pl-9 pr-3 py-2 text-sm outline-none bg-white w-full transition-colors"
                                    style={{
                                        borderColor: fieldError('limcred') ? T.red : T.border,
                                        color: "#1a1d23",
                                    }}
                                    onFocus={e => { if (!fieldError('limcred')) e.currentTarget.style.borderColor = T.cyan }}
                                    onBlur={e => { if (!fieldError('limcred')) e.currentTarget.style.borderColor = T.border }}
                                />
                            </div>
                            {fieldError('limcred') && (
                                <p className="text-[0.62rem] mt-1" style={{ color: T.red }}>{fieldError('limcred')}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                Status
                            </label>
                            <select
                                value={form.bloqueado}
                                onChange={e => set('bloqueado', e.target.value)}
                                className="border px-3 py-2 text-sm outline-none bg-white w-full cursor-pointer h-9 transition-colors"
                                style={{
                                    borderColor: T.border,
                                    color: "#1a1d23",
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = T.cyan }}
                                onBlur={e => { e.currentTarget.style.borderColor = T.border }}
                            >
                                <option value="0">Ativo</option>
                                <option value="1">Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div
                        className="flex justify-end gap-2 pt-4 mt-1 border-t"
                        style={{ borderColor: T.border }}
                    >
                        <Button
                            type="button"
                            variant="outline"
                            rounded-none
                            onClick={() => navigate('/funcionarios')}
                            className="rounded-none border px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider h-9"
                            style={{ borderColor: T.border, color: "#64748b" }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-none flex items-center gap-1.5 px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider h-9 text-white disabled:opacity-60 transition-opacity"
                            style={{ background: T.cyan, border: `1px solid ${T.cyan}` }}
                        >
                            {loading && <Loader2 size={12} className="animate-spin" />}
                            Cadastrar Funcionário
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}
