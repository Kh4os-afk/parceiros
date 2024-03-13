<?php

namespace App\Livewire;

use App\Models\Partner;
use Livewire\Attributes\Rule;
use Livewire\Component;

class CadastrarFuncionario extends Component
{
    #[Rule('string|min:3|max:60|regex:/^[\pL\s\-]+$/|required')]
    public $nome;
    #[Rule('numeric|digits:11|required|unique:partners,cpf')]
    public $cpf;
    #[Rule('integer|min:1|max:9999|unique:partners,matricula|required')]
    public $matricula;
    #[Rule('numeric|min:0|max:999|required')]

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

        Partner::create([
            'nome' => strtoupper($this->nome),
            'cpf' => $this->cpf,
            'matricula' => $this->matricula,
            'limcred' => $this->limcred,
            'bloqueado' => $this->bloqueado,
        ]);

        $this->reset();

        session()->flash('success', 'Funcionario(a) Cadastrado(a) com Sucesso!');

        /*$this->js("alert('Funcionario(a) Cadastrado(a) com Sucesso!')");*/

    }

    public function render()
    {
        return view('livewire.cadastrar-funcionario')
            ->title('Cadastrar Funcionario');
    }
}
