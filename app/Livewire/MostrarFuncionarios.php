<?php

namespace App\Livewire;

use App\Models\Partner;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Component;
use Livewire\WithPagination;

class MostrarFuncionarios extends Component
{
    use WithPagination;
    use LivewireAlert;

    public $query = '';
    public $filter = 'nome';
    public $order = 'asc';
    public function filtrar($filter)
    {
        $this->filter = $filter;
        if ($this->order == 'asc') {
            $this->order = 'desc';
        } else {
            $this->order = 'asc';
        }
    }

    public function search()
    {
        $this->resetPage();
    }

    public function editarFuncionario($id)
    {
        $this->redirectRoute('editar-funcionario.index', ['partner' => $id]);
    }

    public function render()
    {

        return view('livewire.mostrar-funcionarios', [
            'funcionarios' => Partner::where('nome', 'like', '%' . $this->query . '%')
                ->orWhere('matricula', 'like', $this->query)
                ->orWhere('cpf', 'like', '%' . $this->query . '%')
                ->orderBy($this->filter,$this->order)
                ->paginate(10),
        ])
            ->title('Funcionários');
    }
}
