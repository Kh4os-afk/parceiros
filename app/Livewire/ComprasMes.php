<?php

namespace App\Livewire;

use App\Models\Sale;
use Carbon\Carbon;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Attributes\Rule;
use Livewire\Component;

class ComprasMes extends Component
{
    use LivewireAlert;

    public $show = true;

    public $dtinicial, $dtfinal;
    public $vendas;

    public function submit()
    {
        if (empty($this->dtinicial) or empty($this->dtfinal)) {
            $this->alert('error', 'Por favor, selecione uma data válida.');
            return;
        }

        $dtinicial = Carbon::parse($this->dtinicial);
        $dtfinal = Carbon::parse($this->dtfinal);

        // Filtra as vendas pelo mês e ano selecionados e agrupa por cpf e nome
        $this->vendas = Sale::selectRaw('cpf, SUM(vltotal) as total_valor')
            ->whereBetween('dtsaida', [$dtinicial, $dtfinal])
            ->groupBy('cpf')
            ->with('funcionario')
            ->get();

        $this->show = false;
    }

    public function resetar()
    {
        $this->redirectRoute('compras-mes');
    }

    public function render()
    {
        return view('livewire.compras-mes');
    }
}
