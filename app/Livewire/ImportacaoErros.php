<?php

namespace App\Livewire;

use App\Models\Partner;
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

        $this->alert('success', 'Registro Deletado com Sucesso', [
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
        $this->alert('error', 'Deseja Deletar Todos os Registros Com Erro? <br> Esta Operação Não Pode Ser Revertida', [
            'position' => 'center',
            'timer' => '',
            'toast' => false,
            'showConfirmButton' => true,
            'confirmButtonText' => 'Sim, desejo!',
            'onConfirmed' => 'deleteAllConfirmed',
        ]);
    }

    protected $listeners = [
        'deleteAllConfirmed',
        'deleteAllDuplicatesConfirmed',
    ];

    public function deleteAllConfirmed()
    {
        PartnerError::truncate();

        $this->resetPage();

        $this->alert('success', 'Registros Deletados com Sucesso', [
            'timerProgressBar' => true,
        ]);
    }

    public function deleteAllDuplicates()
    {
        $this->alert('error', 'Deseja Deletar Todos os Registros Com CPF Duplicados? <br> Esta Operação Não Pode Ser Revertida', [
            'position' => 'center',
            'timer' => '',
            'toast' => false,
            'showConfirmButton' => true,
            'confirmButtonText' => 'Sim, desejo!',
            'onConfirmed' => 'deleteAllDuplicatesConfirmed',
        ]);
    }

    public function deleteAllDuplicatesConfirmed()
    {
        // Obtém os CPFs já existentes na tabela Partners
        $existingCpfs = Partner::pluck('cpf');

        /* Deleta todos os registros que ja existem na tabela Partners */
        PartnerError::whereIn('cpf', $existingCpfs)->delete();

        $this->resetPage();

        $this->alert('success', 'Registros Duplicados Deletados com Sucesso', [
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
