<?php

namespace App\Livewire;

use App\Models\Partner;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Attributes\Rule;
use Livewire\Component;

class ComprasFuncionario extends Component
{
    use LivewireAlert;

    #[Rule('numeric')]
    public $idfuncionario = 0;
    #[Rule('cpf')]
    public $cpf;
    public $funcionario;
    public $show = true;

    public function submit()
    {
        if ($this->idfuncionario == 0 and $this->cpf == null) {
            $this->alert('error', 'Preencha ao menos um dos campos');
        } else {
            $this->validate();
            $cpf = str_replace(['.', '-', '/'], '', $this->cpf);

            $this->funcionario = Partner::where('id', $this->idfuncionario)->orWhere('cpf', $cpf)->with('compras')->firstOrFail();
            $this->show = false;
        }
    }

    public function resetar()
    {
        $this->redirectRoute('compras-funcionario');
    }

    public function render()
    {
        return view('livewire.compras-funcionario');
    }
}
