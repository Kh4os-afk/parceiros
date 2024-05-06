<?php

namespace App\Livewire;

use App\Models\ChangeLog;
use App\Models\Partner;
use Illuminate\Support\Facades\DB;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Attributes\Rule;
use Livewire\Component;

class CadastrarFuncionario extends Component
{
    use LivewireAlert;

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

    public function update()
    {
        $this->validate();
    }

    public function cadastrar()
    {
        $this->validate();

        DB::beginTransaction();

        try {
            /* Cadastrar Funcionario */
            $partner = Partner::create([
                'nome' => strtoupper($this->nome),
                'cpf' => $this->cpf,
                'matricula' => $this->matricula,
                'limcred' => $this->limcred,
                'bloqueado' => $this->bloqueado,
            ]);

            /* Inserir Log */
            ChangeLog::create([
                'data' => now(),
                'usuario' => auth()->user()->id,
                'operacao' => 'Insert',
                'descricao' => 'Cadastrou o Usuario: ' . $partner->id . ' - ' . $partner->nome . ' CPF: ' . $partner->cpf . '.'
            ]);

            DB::commit();

            $this->reset();
            $this->alert('success', 'Funcionario(a) Cadastrado(a) com Sucesso',[
                'timerProgressBar' => true,
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            $this->alert('error', 'Ocorreu um Erro ao Cadastrar o Funcionário. Por favor, Tente Novamente',[
                'timerProgressBar' => true,
            ]);
        }
    }

    public function render()
    {
        return view('livewire.cadastrar-funcionario')
            ->title('Cadastrar Funcionário');
    }
}
