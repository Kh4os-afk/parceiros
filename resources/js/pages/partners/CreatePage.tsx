import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api from '@/lib/axios'
import { stripCPF } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface Errors { [key: string]: string[] }

export default function CreatePage() {
    const navigate = useNavigate()
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
            await api.post('/partners', { ...form, cpf: stripCPF(form.cpf) })
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
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
            <div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Cadastros</p>
                <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">Cadastrar Funcionário</h1>
            </div>

            <div className="bg-white border border-(--border)">
                <div className="px-5 py-3 border-b border-(--border) bg-muted flex items-center gap-2">
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">Dados do Funcionário</span>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4" autoComplete="off">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Nome Completo</label>
                            <Input
                                value={form.nome}
                                onChange={e => set('nome', e.target.value)}
                                placeholder="Antonio da Silva"
                                className={fieldError('nome') ? 'border-(--destructive)' : ''}
                            />
                            {fieldError('nome') && <p className="text-[0.68rem] text-(--destructive)">{fieldError('nome')}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Matrícula</label>
                            <Input
                                value={form.matricula}
                                onChange={e => set('matricula', e.target.value)}
                                placeholder="00142"
                                className={fieldError('matricula') ? 'border-(--destructive) tracking-wider' : 'tracking-wider'}
                            />
                            {fieldError('matricula') && <p className="text-[0.68rem] text-(--destructive)">{fieldError('matricula')}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">CPF</label>
                            <Input
                                value={form.cpf}
                                onChange={e => set('cpf', e.target.value)}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className={fieldError('cpf') ? 'border-(--destructive) tracking-widest' : 'tracking-widest'}
                            />
                            {fieldError('cpf') && <p className="text-[0.68rem] text-(--destructive)">{fieldError('cpf')}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Limite de Crédito (R$)</label>
                            <Input
                                value={form.limcred}
                                onChange={e => set('limcred', e.target.value)}
                                placeholder="350,00"
                                className={fieldError('limcred') ? 'border-(--destructive)' : ''}
                            />
                            {fieldError('limcred') && <p className="text-[0.68rem] text-(--destructive)">{fieldError('limcred')}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Status</label>
                            <select
                                value={form.bloqueado}
                                onChange={e => set('bloqueado', e.target.value)}
                                className="border border-(--border) px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) cursor-pointer h-9"
                            >
                                <option value="0">Ativo</option>
                                <option value="1">Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-(--border) mt-1">
                        <button
                            type="button"
                            onClick={() => navigate('/funcionarios')}
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
                            Cadastrar Funcionário
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
