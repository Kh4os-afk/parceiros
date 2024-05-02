<?php

namespace App\Livewire;

use App\Models\ChangeLog;
use App\Models\Partner;
use App\Models\PartnerError;
use Illuminate\Support\Facades\DB;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Attributes\Rule;
use Livewire\Component;
use Livewire\WithFileUploads;
use League\Csv\Reader;
use League\Csv\Statement;
use Illuminate\Support\Facades\Validator;
use function Laravel\Prompts\alert;

class ImportarCSV extends Component
{
    use WithFileUploads;
    use LivewireAlert;

    #[Rule('required|mimes:csv,txt')]
    public $csv;
    public $erros = 0;

    public function processar()
    {
        $this->validate();

        /*Abre o CSV Seta o Delimitador e o Cabeçalho*/
        $csv = Reader::createFromPath($this->csv->getRealPath(), 'r');
        $csv->setDelimiter(';');
        $csv->setHeaderOffset(0);

        $records = $csv->getRecords();
        foreach ($records as $key => $record) {

            if (count($record) < 5) {
                $this->alert('error', 'O Arquivo CSV Deve Conter Pelo Menos 5 Campos', [
                    'timerProgressBar' => true,
                ]);
                return redirect()->route('importar-csv.index');
            }

            $values = array_values($record);

            if (isset($values[4])) {
                $values[4] = $values[4] == 'S' ? 1 : 0;
            }

            $rules = [
                0 => ['integer', 'min:1', 'max:99999', 'unique:partners,matricula', 'required'], // Matrícula
                1 => ['numeric', 'digits:11', 'required', 'unique:partners,cpf', 'cpf'], // CPF
                2 => ['string', 'min:3', 'max:60', 'regex:/^[\pL\s\-]+$/', 'required'], // Nome
                3 => ['numeric', 'min:0', 'max:999', 'required'], // Limite de Crédito
                4 => ['integer', 'min:0', 'max:1', 'required'], // Bloqueado
            ];

            // Criar um validador
            $validator = Validator::make($values, $rules);

            // Verificar se a validação falhou
            if ($validator->fails()) {
                DB::beginTransaction();
                try {
                    /* Tratativa dos Erros */
                    $erros = str_replace([' 0 ', ' 1 ', ' 2 ', ' 3 ', ' 4 '], [' Matricula ', ' CPF ', ' Nome ', ' Limite de Credito ', ' Bloqueado '], implode(' ', $validator->errors()->all()));

                    $partnerError = PartnerError::create([
                        'matricula' => $values[0],
                        'cpf' => trim(preg_replace('/\D/', '', $values[1])),
                        'nome' => strtoupper(preg_replace('/[^\p{L}\p{N}\s]/u', '', $values[2])),
                        'limcred' => $values[3],
                        'bloqueado' => $values[4],
                        'erros' => $erros,
                    ]);

                    /* Inserir Log */
                    ChangeLog::create([
                        'data' => now(),
                        'usuario' => auth()->user()->id,
                        'operacao' => 'Update',
                        'descricao' => 'Funcionario Importado com erro de validação: ' . $partnerError->id . ' - ' . $partnerError->nome . ' CPF: ' . $partnerError->cpf,
                    ]);

                    DB::commit();

                    $this->erros += 1;

                } catch (\Exception $e) {
                    DB::rollBack();
                    /* Cria a Mensagem de Erro */
                    $mensagem = urlencode($e->getMessage());
                    $this->alert('error', 'Erro ao Importar Funcionário' . '<br><button type="button" class="swal2-confirm swal2-styled" style="padding: 0.225em 1.1em; margin-top: 0.8250em"><a style="color: white" target="_blank" href="https://api.whatsapp.com/send?phone=+5592992309115&text=%20%F0%9F%98%A2%20Oi!%20Tive%20Problemas%20%20%F0%9F%98%A2%0A%0A```' . $mensagem . '```">Reportar Erro</a></button>', [
                        'position' => 'center',
                        'timer' => '',
                        'toast' => false,
                    ]);
                    break;
                }


            } else {
                DB::beginTransaction();
                try {
                    // Lógica para lidar com dados válidos, como salvar no banco de dados
                    $insert = Partner::create([
                        'matricula' => $values[0],
                        'cpf' => trim(preg_replace('/\D/', '', $values[1])),
                        'nome' => strtoupper(preg_replace('/[^\p{L}\p{N}\s]/u', '', $values[2])),
                        'limcred' => $values[3],
                        'bloqueado' => $values[4],
                    ]);

                    /* Inserir Log */
                    ChangeLog::create([
                        'data' => now(),
                        'usuario' => auth()->user()->id,
                        'operacao' => 'Update',
                        'descricao' => 'Funcionario Importado Via CSV ' . $insert->id . ' - ' . $insert->nome . ' CPF: ' . $insert->cpf,
                    ]);

                    DB::commit();

                } catch (\Exception $e) {
                    DB::rollBack();
                    $this->alert('error', 'Erro ao Importar Funcionário', [
                        'timerProgressBar' => true,
                        'position' => 'center',
                        'toast' => false,
                    ]);
                }
            }
        }
        if ($this->erros <> 0) {
            $this->redirectRoute('importacao-erros.index');
        }
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
