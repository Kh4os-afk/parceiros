<?php

namespace App\Livewire;

use App\Models\ChangeLog;
use App\Models\Partner;
use Illuminate\Support\Facades\DB;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Rule;
use Livewire\Component;

class EditarFuncionario extends Component
{
    use LivewireAlert;

    #[Locked]
    public $id;
    #[Rule('string|min:3|max:60|regex:/^[\pL\s\-]+$/|required')]
    public $nome;
    #[Rule('numeric|digits:11|required')]
    public $cpf;
    #[Rule('integer|min:1|max:99999|required')]
    public $matricula;
    #[Rule('numeric|min:0|max:999|required')]
    public $limcred;
    #[Rule('integer|min:0|max:1|required')]
    public $bloqueado;

    public function mount(Partner $partner)
    {
        $this->id = $partner->id;
        $this->nome = ucwords(strtolower($partner->nome));
        $this->cpf = $partner->cpf;
        $this->matricula = $partner->matricula;
        $this->limcred = $partner->limcred;
        $this->bloqueado = $partner->bloqueado;
    }

    public function update()
    {
        $this->validate();
    }

    public function editar()
    {
        $this->validate();

        $funcionario = Partner::findOrFail($this->id);
        $funcionarioOld = $funcionario->getOriginal();

        DB::beginTransaction();
        try {
            $funcionario->update([
                'nome' => strtoupper($this->nome),
                'matricula' => $this->matricula,
                'limcred' => $this->limcred,
                'bloqueado' => $this->bloqueado,
                'alterado' => 1,
            ]);

            /* Inserir Log */
            ChangeLog::create([
                'data' => now(),
                'usuario' => auth()->user()->id,
                'operacao' => 'Update',
                'descricao' => 'Editou o Usuario: ' . $funcionario->id . ' O nome de ' . $funcionarioOld['nome'] . ' Para ' . $funcionario->nome . '. A Matricula de '
                    . $funcionarioOld['matricula'] . ' Para ' . $funcionario->matricula . '. O Limite de Credito de ' . $funcionarioOld['limcred'] . ' Para ' . $funcionario->limcred
                    . '. O Bloqueio de ' . $funcionarioOld['bloqueado'] . ' Para ' . $funcionario->bloqueado . '.'
            ]);

            DB::commit();

            $this->alert('success', 'Funcionario Editado',[
                'timerProgressBar' => true,
            ]);

            /*return redirect()->route('mostrar-funcionarios.index')->with('success', 'Funcionario(a) Alterado com Sucesso!');*/
        } catch (\Exception $e) {
            DB::rollBack();
            $this->alert('error', 'Ocorreu um Erro ao Editar o Funcionário. Por favor, Tente Novamente',[
                'timerProgressBar' => true,
            ]);
        }
    }
    public function render()
    {
        return view('livewire.editar-funcionario')
            ->title('Editar Funcionário');
    }
}
