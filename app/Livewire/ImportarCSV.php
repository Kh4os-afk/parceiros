<?php

namespace App\Livewire;

use App\Models\Partner;
use Livewire\Attributes\Rule;
use Livewire\Component;
use Livewire\WithFileUploads;
use League\Csv\Reader;
use League\Csv\Statement;
use Illuminate\Support\Facades\Validator;

class ImportarCSV extends Component
{
    use WithFileUploads;

    #[Rule('required|mimes:csv,txt')]
    public $csv;
    public $erros = 0;
    public $funcionarioErros;

    public function processar()
    {
        $this->validate();

        /*Abre o CSV Seta o Delimitador e o Cabeçalho*/
        $csv = Reader::createFromPath($this->csv->getRealPath(), 'r');
        $csv->setDelimiter(';');
        $csv->setHeaderOffset(0);

        $records = $csv->getRecords();
        foreach ($records as $key => $record) {
            $values = array_values($record);

            $values[4] = $values[4] == 'S' ? 1 : 0;

            $rules = [
                0 => ['integer', 'min:1', 'max:9999','unique:partners,matricula','required'], // Matrícula
                1 => ['numeric', 'digits:11', 'required', 'unique:partners,cpf'], // CPF
                2 => ['string', 'min:3', 'max:60','regex:/^[\pL\s\-]+$/','required'], // Nome
                3 => ['numeric', 'min:0', 'max:999', 'required'], // Limite de Crédito
                4 => ['integer', 'min:0', 'max:1', 'required'], // Bloqueado
            ];

            // Criar um validador
            $validator = Validator::make($values, $rules);

            // Verificar se a validação falhou
            if ($validator->fails()) {
                // Lógica para lidar com falhas na validação, se necessário
                $this->funcionarioErros[] = [
                    'funcionario' => $values,
                    'erros' => $validator->errors()->all(),
                ];

                $this->erros += 1;
            } else {
                // Lógica para lidar com dados válidos, como salvar no banco de dados
                $insert = Partner::create([
                    'matricula' => $values[0],
                    'cpf' => $values[1],
                    'nome' => strtoupper(preg_replace('/[^\p{L}\p{N}\s]/u', '', $values[2])),
                    'limcred' => $values[3],
                    'bloqueado' => $values[4],
                ]);
            }
        }

        /*$stmt = Statement::create();
        ->limit(25);

        $records = $stmt->process($csv);
        foreach ($records as $record) {
            dump($record);
        }*/
    }

    public function resetar()
    {
        $this->reset();
    }

    public function render()
    {
        return view('livewire.importar-c-s-v')
            ->title('Importar Funcionários');
    }
}
