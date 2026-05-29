import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, toTitleCase } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface Errors { [key: string]: string[] }

const corners = [
    'top-0 left-0 border-t-2 border-l-2',
    'top-0 right-0 border-t-2 border-r-2',
    'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-0 right-0 border-b-2 border-r-2',
]

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
                    limcred:   String(p.limcred ?? ''),
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
                limcred:   form.limcred,
                bloqueado: form.bloqueado,
            })
            navigate('/importar/erros')
        } catch (err: any) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return (
        <div className="flex items-center justify-center h-40 text-[0.75rem] text-(--muted-foreground) animate-pulse">
            Carregando…
        </div>
    )

    return (
        <div className="flex flex-col gap-5 max-w-2xl animate-[fade-in_0.2s_ease-out]">

            {/* ── Header ── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 6%, transparent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {corners.map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 border-(--primary)/30 ${cls}`} />
                ))}

                <div className="relative px-4 md:px-7 py-5">
                    <button
                        onClick={() => navigate('/importar/erros')}
                        className="flex items-center gap-1.5 text-[0.5rem] uppercase tracking-[0.25em] text-(--muted-foreground) hover:text-(--primary) transition-colors mb-3"
                    >
                        <ArrowLeft size={10} /> Erros de Importação
                    </button>
                    <p className="text-[0.5rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Importação</p>
                    <h1 className="text-xl font-black uppercase tracking-[0.08em] text-(--foreground)">
                        Corrigir Registro
                    </h1>
                    {form.nome && (
                        <p className="text-[0.65rem] text-(--muted-foreground) mt-1.5">
                            {toTitleCase(form.nome)} · {form.cpf}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Motivo do erro ── */}
            {motivo && (
                <div className="relative bg-amber-500/8 border border-amber-500/25 overflow-hidden">
                    <div className="absolute left-0 inset-y-0 w-0.5 bg-amber-500" />
                    <div className="flex items-start gap-3 px-5 py-4">
                        <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[0.5rem] font-black uppercase tracking-[0.25em] text-amber-500 mb-1">
                                Motivo do Erro
                            </p>
                            <p className="text-[0.72rem] text-amber-600 leading-relaxed">{motivo}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Formulário ── */}
            <div className="bg-card border border-(--border)">
                <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center gap-2">
                    <CheckCircle2 size={11} className="text-(--primary) opacity-70" />
                    <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                        Dados do Funcionário
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5" autoComplete="off">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                Nome Completo
                            </label>
                            <Input
                                value={form.nome}
                                onChange={e => set('nome', e.target.value)}
                                className={errors.nome ? 'border-(--destructive)' : ''}
                            />
                            {errors.nome?.[0] && <p className="text-[0.62rem] text-(--destructive)">{errors.nome[0]}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                Matrícula
                            </label>
                            <Input
                                value={form.matricula}
                                onChange={e => set('matricula', e.target.value)}
                                className={errors.matricula ? 'border-(--destructive) tracking-wider' : 'tracking-wider'}
                            />
                            {errors.matricula?.[0] && <p className="text-[0.62rem] text-(--destructive)">{errors.matricula[0]}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                CPF
                            </label>
                            <Input
                                value={form.cpf}
                                onChange={e => set('cpf', e.target.value)}
                                maxLength={14}
                                placeholder="000.000.000-00"
                                className={errors.cpf ? 'border-(--destructive) tracking-widest' : 'tracking-widest'}
                            />
                            {errors.cpf?.[0] && <p className="text-[0.62rem] text-(--destructive)">{errors.cpf[0]}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                Limite Mensal (R$)
                            </label>
                            <Input
                                value={form.limcred}
                                onChange={e => set('limcred', e.target.value)}
                                className={errors.limcred ? 'border-(--destructive)' : ''}
                            />
                            {errors.limcred?.[0] && <p className="text-[0.62rem] text-(--destructive)">{errors.limcred[0]}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                Status
                            </label>
                            <select
                                value={form.bloqueado}
                                onChange={e => set('bloqueado', e.target.value)}
                                className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) cursor-pointer h-9 transition-colors ${
                                    form.bloqueado === '1' ? 'text-(--destructive) border-(--destructive)/50' : 'border-(--border)'
                                }`}
                            >
                                <option value="0">Ativo</option>
                                <option value="1">Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-(--border)">
                        <button
                            type="button"
                            onClick={() => navigate('/importar/erros')}
                            className="border border-(--border) px-5 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-(--primary) text-white px-6 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] hover:opacity-90 disabled:opacity-60 transition-opacity"
                        >
                            {loading
                                ? <><Loader2 size={12} className="animate-spin" /> Aprovando…</>
                                : <><CheckCircle2 size={12} /> Aprovar e Cadastrar</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
