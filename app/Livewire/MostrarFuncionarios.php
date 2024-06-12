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

    public function updatingQuery()
    {
        $this->resetPage();
    }

    public function filtrar($filter)
    {
        $this->filter = $filter;
        $this->order = $this->order == 'asc' ? 'desc' : 'asc';
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
                ->orderBy($this->filter, $this->order)
                ->paginate(10),

        ])
            ->with(['filter' => $this->filter, 'order' => $this->order])
            ->title('Funcionários');
    }
}
