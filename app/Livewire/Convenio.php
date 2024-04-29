<?php

namespace App\Livewire;

use Livewire\Component;
use Jantinnerezo\LivewireAlert\LivewireAlert;

class Convenio extends Component
{
    use LivewireAlert;

    public function submit()
    {
        $this->alert('success', 'Basic Alert',[
            'timerProgressBar' => true,
        ]);
    }

    public function render()
    {
        return view('livewire.convenio')
            ->title('Baratão Convênio');
    }

    public function funcionarios()
    {
        $this->redirectRoute('mostrar-funcionarios.index');
    }

    public function funcionariosErros()
    {
        $this->redirectRoute('importacao-erros.index');
    }
}
