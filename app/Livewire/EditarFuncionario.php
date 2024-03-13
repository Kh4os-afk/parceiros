<?php

namespace App\Livewire;

use App\Models\Partner;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Rule;
use Livewire\Component;

class EditarFuncionario extends Component
{
    #[Locked]
    public $id;
    #[Rule('string|min:3|max:60|regex:/^[\pL\s\-]+$/|required')]
    public $nome;
    #[Rule('numeric|digits:11|required')]
    public $cpf;
    #[Rule('integer|min:1|max:9999|required')]
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

        $funcionario = Partner::findOrFail($this->id)->update([
            'nome' => strtoupper($this->nome),
            'matricula' => $this->matricula,
            'limcred' => $this->limcred,
            'bloqueado' => $this->bloqueado,
        ]);

        session()->flash('succes','Funcionario(a) Alterado com Sucesso!');
    }

    public function render()
    {
        return view('livewire.editar-funcionario')
            ->title('Editar Funcionario');
    }
}
