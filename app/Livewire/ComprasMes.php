<?php

namespace App\Livewire;

use App\Models\Sale;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Attributes\Rule;
use Livewire\Component;

class ComprasMes extends Component
{
    use LivewireAlert;

    public $show = true;
    public $mes;
    public $meses = [];
    public $vendas;


    public function mount()
    {
        $this->gerarMeses();
    }

    public function gerarMeses()
    {
        $currentMonth = now()->startOfMonth();
        $startMonth = $currentMonth->copy()->subMonths(6);
        $endMonth = $currentMonth->copy()->addMonths(6);

        while ($startMonth <= $endMonth) {
            $this->meses[] = $startMonth->format('m/Y');
            $startMonth->addMonth();
        }
    }

    public function submit()
    {
        if (empty($this->mes)) {
            $this->alert('error', 'Por favor, selecione um mês válido.');
            return;
        }

        // Extrai mês e ano da string selecionada
        [$mes, $ano] = explode('/', $this->mes);

        // Filtra as vendas pelo mês e ano selecionados
        $this->vendas = Sale::whereMonth('dtsaida', $mes)
            ->whereYear('dtsaida', $ano)
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
