import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import api from '@/lib/axios'
import { formatCPF, formatMoneyInput, maskMoney, parseMoney, toTitleCase } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface Errors { [key: string]: string[] }

const T = { bg:"#f4f5f8", border:"#e8eaef", cyan:"#0099cc", purple:"#7c3aed", green:"#059669", amber:"#d97706", red:"#dc2626" }
const cardStyle = { background:"#ffffff", border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger = (d=0): any => ({ hidden:{}, visible:{ transition:{ staggerChildren:0.07, delayChildren:d } } })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rise: any = { hidden:{ opacity:0, y:20, filter:"blur(8px)" }, visible:{ opacity:1, y:0, filter:"blur(0px)", transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } }

export default function EditErrorPage() {
    const { id }     = useParams()
    const navigate   = useNavigate()
    const [form,     setForm]     = useState({ nome: '', cpf: '', matricula: '', limcred: '', bloqueado: '0' })
    const [motivo,   setMotivo]   = useState('')
    const [errors,   setErrors]   = useState<Errors>({})
    const [loading,  setLoading]  = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        api.get(`/partner-errors/${id}`)
            .then(res => {
                const p = res.data
                setMotivo(p.erros ?? '')
                setForm({
                    nome:      toTitleCase(p.nome),
                    cpf:       formatCPF(p.cpf),
                    matricula: p.matricula != null ? String(p.matricula) : '',
                    limcred:   formatMoneyInput(p.limcred ?? 0),
                    bloqueado: String(p.bloqueado ?? '0'),
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
            await api.post(`/partner-errors/${id}/approve`, {
                nome:      form.nome,
                cpf:       form.cpf.replace(/\D/g, ''),
                matricula: form.matricula || null,
                limcred:   parseMoney(form.limcred),
                bloqueado: form.bloqueado,
            })
            navigate('/importar/erros')
        } catch (err: any) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <motion.div
                className="-m-4 md:-m-6 p-4 md:p-6 min-h-screen flex flex-col gap-5"
                style={{ background: T.bg }}
                variants={stagger(0.04)} initial="hidden" animate="visible"
            >
                {/* Header skeleton */}
                <motion.div variants={rise} className="flex flex-col gap-3">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-8 w-52" />
                    <Skeleton className="h-4 w-64" />
                </motion.div>

                {/* Alert skeleton */}
                <motion.div variants={rise} className="rounded-md p-4" style={{ background:"#fffbeb", border:"1px solid #fde68a" }}>
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-2 flex-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </motion.div>

                {/* Form card skeleton */}
                <motion.div variants={rise} style={cardStyle} className="flex flex-col">
                    <div className="px-6 py-3.5 flex items-center gap-2" style={{ borderBottom:`1px solid ${T.border}`, background:"#f9fafb" }}>
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                    <div className="p-6 flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[0,1,2].map(i => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-9 w-full" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-3" style={{ borderTop:`1px solid ${T.border}` }}>
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-40" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div
            className="-m-4 md:-m-6 p-4 md:p-6 min-h-screen flex flex-col gap-5"
            style={{ background: T.bg }}
            variants={stagger(0.04)} initial="hidden" animate="visible"
        >
            {/* ── Header ── */}
            <motion.div variants={rise} className="flex flex-col gap-1">
                <button
                    onClick={() => navigate('/importar/erros')}
                    className="flex items-center gap-1.5 text-[0.58rem] font-black uppercase tracking-[0.22em] text-muted-foreground hover:text-primary transition-colors w-fit mb-1"
                >
                    <ArrowLeft size={11} /> Erros de Importação
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
                    Corrigir Registro
                </h1>
                {form.nome && (
                    <p className="text-[0.68rem] text-muted-foreground">
                        {toTitleCase(form.nome)} · {form.cpf}
                    </p>
                )}
            </motion.div>

            {/* ── Motivo do erro ── */}
            {motivo && (
                <motion.div
                    variants={rise}
                    className="flex items-start gap-3 p-4 rounded-md"
                    style={{ background:"#fffbeb", border:"1px solid #fde68a" }}
                >
                    <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: T.amber }} />
                    <div>
                        <p className="text-[0.55rem] font-black uppercase tracking-[0.22em] mb-1" style={{ color: T.amber }}>
                            Motivo do Erro
                        </p>
                        <p className="text-[0.72rem] leading-relaxed" style={{ color:"#92400e" }}>{motivo}</p>
                    </div>
                </motion.div>
            )}

            {/* ── Formulário ── */}
            <motion.div variants={rise} style={cardStyle} className="flex flex-col">
                <div
                    className="px-6 py-3.5 flex items-center gap-2"
                    style={{ borderBottom:`1px solid ${T.border}`, background:"#f9fafb" }}
                >
                    <CheckCircle2 size={12} style={{ color: T.cyan, opacity: 0.8 }} />
                    <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Dados do Funcionário
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5" autoComplete="off">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Nome Completo
                            </label>
                            <Input
                                value={form.nome}
                                onChange={e => set('nome', e.target.value)}
                                placeholder="Antonio da Silva"
                                className={errors.nome ? 'border-(--destructive)' : ''}
                            />
                            {errors.nome?.[0] && (
                                <p className="text-[0.62rem]" style={{ color: T.red }}>{errors.nome[0]}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Matrícula <span className="font-normal normal-case tracking-normal">(opcional)</span>
                            </label>
                            <Input
                                value={form.matricula}
                                onChange={e => set('matricula', e.target.value)}
                                placeholder="00142"
                                className={errors.matricula ? 'border-(--destructive) tracking-wider' : 'tracking-wider'}
                            />
                            {errors.matricula?.[0] && (
                                <p className="text-[0.62rem]" style={{ color: T.red }}>{errors.matricula[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                CPF
                            </label>
                            <Input
                                value={form.cpf}
                                onChange={e => set('cpf', e.target.value)}
                                maxLength={14}
                                placeholder="000.000.000-00"
                                inputMode="numeric"
                                className={errors.cpf ? 'border-(--destructive) tracking-widest' : 'tracking-widest'}
                            />
                            {errors.cpf?.[0] && (
                                <p className="text-[0.62rem]" style={{ color: T.red }}>{errors.cpf[0]}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Limite Mensal (R$)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.62rem] text-muted-foreground pointer-events-none">R$</span>
                                <Input
                                    value={form.limcred}
                                    onChange={e => set('limcred', maskMoney(e.target.value))}
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    className={`pl-9 ${errors.limcred ? 'border-(--destructive)' : ''}`}
                                />
                            </div>
                            {errors.limcred?.[0] && (
                                <p className="text-[0.62rem]" style={{ color: T.red }}>{errors.limcred[0]}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Status
                            </label>
                            <select
                                value={form.bloqueado}
                                onChange={e => set('bloqueado', e.target.value)}
                                className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) cursor-pointer h-9 transition-colors rounded-md ${
                                    form.bloqueado === '1' ? 'text-(--destructive) border-(--destructive)/50' : 'border-(--border)'
                                }`}
                            >
                                <option value="0">Ativo</option>
                                <option value="1">Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3" style={{ borderTop:`1px solid ${T.border}` }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/importar/erros')}
                            className="text-[0.58rem] font-black uppercase tracking-[0.15em]"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 text-[0.58rem] font-black uppercase tracking-[0.15em] text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                            style={{ background: T.cyan }}
                        >
                            {loading
                                ? <><Loader2 size={12} className="animate-spin" /> Aprovando…</>
                                : <><CheckCircle2 size={12} /> Aprovar e Cadastrar</>
                            }
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}
