<?php

namespace App\Livewire;

use App\Models\ChangeLog;
use App\Models\Partner;
use App\Models\PartnerError;
use Illuminate\Support\Facades\DB;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Rule;
use Livewire\Component;

class EditarFuncionarioErro extends Component
{
    use LivewireAlert;

    #[Locked]
    public $id;
    #[Rule('string|min:3|max:60|regex:/^[\pL\s\-áéíóúâêîôûàèìòùãẽĩõũäëïöüçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃẼĨÕŨÄËÏÖÜÇ]+$/u|required')]
    public $nome;
    #[Rule('numeric|digits:11|required|unique:partners,cpf|cpf')]
    public $cpf;
    #[Rule('integer|min:1|max:99999|unique:partners,matricula|required')]
    public $matricula;
    #[Rule('numeric|min:0|max:999|required',as: 'limite de credito')]
    public $limcred;
    #[Rule('integer|min:0|max:1|required')]
    public $bloqueado = 1;

    public function mount(PartnerError $partner)
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

        DB::beginTransaction();
        try {
            $funcionario = Partner::create([
                'nome' => strtoupper($this->nome),
                'cpf' => $this->cpf,
                'matricula' => $this->matricula,
                'limcred' => $this->limcred,
                'bloqueado' => $this->bloqueado,
            ]);

            if ($funcionario) {
                PartnerError::find($this->id)->delete();
            }

            /* Inserir Log */
            ChangeLog::create([
                'data' => now(),
                'usuario' => auth()->user()->id,
                'operacao' => 'Insert',
                'descricao' => 'Ajustou o Cadastro com erro do Usuario: ' . $funcionario->id . ' - ' . $funcionario->nome . ' CPF: ' . $funcionario->cpf . '.'
            ]);

            DB::commit();

            $this->alert('success', 'Funcionario Editado',[
                'timerProgressBar' => true,
            ]);

            $this->redirectRoute('importacao-erros.index');

            /*$this->redirectRoute('convenio.index');*/
        } catch (\Exception $e) {
            DB::rollBack();
            $descricao = $funcionario ? 'Erro ao cadastrar o Usuario: ' . $funcionario->id . ' - ' . $funcionario->nome . ' CPF: ' . $funcionario->cpf . '.' : 'Erro ao cadastrar o Usuario.';
            ChangeLog::create([
                'data' => now(),
                'usuario' => auth()->user()->id,
                'operacao' => 'Insert',
                'descricao' => $descricao,
            ]);
            $this->alert('error', 'Ocorreu um Erro ao Editar o Funcionário. Por favor, Tente Novamente',[
                'timerProgressBar' => true,
            ]);
        }
    }

    public function render()
    {
        return view('livewire.editar-funcionario-erro')
            ->title('Editar Funcionário com Erro');
    }
}
