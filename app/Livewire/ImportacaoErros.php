<?php

namespace App\Livewire;

use App\Models\PartnerError;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Component;
use Livewire\WithPagination;

class ImportacaoErros extends Component
{
    use WithPagination;
    use LivewireAlert;

    public $erros;

    public function delete(PartnerError $partnerError)
    {
        $partnerError->delete();

        $this->alert('success', 'Registro Deletado com Sucesso',[
            'timerProgressBar' => true,
        ]);

    }

    public function updatingSearchInput(): void
    {
        $this->gotoPage(1);
    }

    public function editarFuncionario($id)
    {
        $this->redirectRoute('editar-funcionario-erro.index', ['partner' => $id]);
    }

    public function deleteAll()
    {
        PartnerError::truncate();
        $this->alert('success', 'Registros Deletados com Sucesso',[
            'timerProgressBar' => true,
        ]);
    }

    public function render()
    {
        $this->erros = PartnerError::count();

        return view('livewire.importacao-erros', [
            'funcionarios' => PartnerError::paginate(10),
        ])
            ->title('Erros Importação');
    }
}
