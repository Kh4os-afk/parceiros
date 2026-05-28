import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, toTitleCase } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface Errors { [key: string]: string[] }

export default function EditErrorPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState({ nome: '', cpf: '', matricula: '', limcred: '', bloqueado: '0' })
    const [motivo, setMotivo] = useState('')
    const [errors, setErrors] = useState<Errors>({})
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        api.get(`/partner-errors/${id}`)
            .then(res => {
                const p = res.data
                setMotivo(p.erros ?? '')
                setForm({
                    nome: toTitleCase(p.nome),
                    cpf: formatCPF(p.cpf),
                    matricula: p.matricula != null ? String(p.matricula) : '',
                    limcred: String(p.limcred ?? ''),
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
                nome: form.nome,
                cpf: form.cpf.replace(/\D/g, ''),
                matricula: form.matricula || null,
                limcred: form.limcred,
                bloqueado: form.bloqueado,
            })
            navigate('/importar/erros')
        } catch (err: any) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="text-sm text-(--muted-foreground) animate-pulse">Carregando…</div>

    return (
        <div className="flex flex-col gap-4 max-w-2xl animate-[fade-in_0.2s_ease-out]">
            <div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Erros de Importação</p>
                <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">
                    Corrigir — {toTitleCase(form.nome || '')}
                </h1>
            </div>

            {motivo && (
                <div className="flex items-start gap-2.5 px-4 py-3 border border-amber-200 bg-amber-50">
                    <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-amber-700 mb-0.5">Motivo do Erro</p>
                        <p className="text-[0.78rem] text-amber-800">{motivo}</p>
                    </div>
                </div>
            )}

            <div className="bg-white border border-(--border)">
                <div className="px-5 py-3 border-b border-(--border) bg-muted">
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">Dados do Funcionário</span>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4" autoComplete="off">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Nome Completo</label>
                            <Input
                                value={form.nome}
                                onChange={e => set('nome', e.target.value)}
                                className={errors.nome ? 'border-(--destructive)' : ''}
                            />
                            {errors.nome?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors.nome[0]}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Matrícula</label>
                            <Input
                                value={form.matricula}
                                onChange={e => set('matricula', e.target.value)}
                                className={errors.matricula ? 'border-(--destructive) tracking-wider' : 'tracking-wider'}
                            />
                            {errors.matricula?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors.matricula[0]}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">CPF</label>
                            <Input
                                value={form.cpf}
                                onChange={e => set('cpf', e.target.value)}
                                maxLength={14}
                                placeholder="000.000.000-00"
                                className={errors.cpf ? 'border-(--destructive) tracking-widest' : 'tracking-widest'}
                            />
                            {errors.cpf?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors.cpf[0]}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Limite de Crédito (R$)</label>
                            <Input
                                value={form.limcred}
                                onChange={e => set('limcred', e.target.value)}
                                className={errors.limcred ? 'border-(--destructive)' : ''}
                            />
                            {errors.limcred?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors.limcred[0]}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Status</label>
                            <select
                                value={form.bloqueado}
                                onChange={e => set('bloqueado', e.target.value)}
                                className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) cursor-pointer h-9 ${form.bloqueado === '1' ? 'text-red-600 border-red-300' : 'border-(--border)'}`}
                            >
                                <option value="0">Ativo</option>
                                <option value="1">Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-(--border) mt-1">
                        <button
                            type="button"
                            onClick={() => navigate('/importar/erros')}
                            className="border border-(--border) px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-1.5 bg-(--primary) text-white px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity"
                        >
                            {loading && <Loader2 size={12} className="animate-spin" />}
                            Aprovar e Cadastrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
