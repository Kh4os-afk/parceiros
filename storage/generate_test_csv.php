<?php
/**
 * Gerador de CSV de teste — 700 funcionários
 * Inclui cenários de erro para validar o tratamento da importação.
 *
 * Executar: php storage/generate_test_csv.php
 * Saída:    storage/app/funcionarios_teste_700.csv
 */

// ── Gerador de CPF matematicamente válido ───────────────────────────────────
function gerarCpf(): string {
    do {
        $n = [];
        for ($i = 0; $i < 9; $i++) {
            $n[] = rand(0, 9);
        }

        // Rejeita CPFs com todos os dígitos iguais (111.111.111-11 etc.)
        if (count(array_unique($n)) === 1) continue;

        // Primeiro dígito verificador
        $s = 0;
        for ($i = 0; $i < 9; $i++) $s += $n[$i] * (10 - $i);
        $r = $s % 11;
        $n[] = $r < 2 ? 0 : 11 - $r;

        // Segundo dígito verificador
        $s = 0;
        for ($i = 0; $i < 10; $i++) $s += $n[$i] * (11 - $i);
        $r = $s % 11;
        $n[] = $r < 2 ? 0 : 11 - $r;

        $cpf = implode('', $n);
    } while (strlen($cpf) !== 11);

    return $cpf;
}

// ── Nomes brasileiros comuns ─────────────────────────────────────────────────
$prenomes = [
    'ANA','MARIA','JOSE','JOAO','CARLOS','PAULO','PEDRO','LUCAS','GABRIEL','MATEUS',
    'RAFAEL','DIEGO','ANDERSON','RODRIGO','FELIPE','MARCOS','EDUARDO','FERNANDO','THIAGO',
    'LEANDRO','BRUNO','MARCELO','ANDRE','FABIO','ALEXANDRE','ROBERTO','SERGIO','ADRIANO',
    'RENATO','DANIEL','PATRICIA','JULIANA','CAMILA','FERNANDA','ALINE','RENATA','CRISTINA',
    'MARCIA','SANDRA','LUCIA','CLAUDIA','ROSANA','TATIANA','VANESSA','JESSICA','PRISCILA',
    'SIMONE','NATALIA','LETICIA','BRUNA','LARISSA','LIVIA','CARLA','MARTA','VERA','ALICE',
    'FLAVIA','BEATRIZ','CAROLINA','MONICA','SILVANA','DENISE','ELIANE','VIVIANE','SUELI',
    'ERIKA','CINTIA','DEBORA','MIRIAM','CRISTIANE','IRENE','SOLANGE','NEUSA','TEREZA',
    'APARECIDA','BENEDITA','ELISABETE','ROSANGELA','MARIANA','AMANDA','GIOVANNA','HELOISA',
    'MILENA','ISABELA','BIANCA','NATHALIA','RAFAELA','TAMIRES','GISELE','KARINA','VIVIAN',
];

$sobrenomes = [
    'SILVA','SANTOS','OLIVEIRA','SOUZA','RODRIGUES','FERREIRA','ALVES','PEREIRA','LIMA',
    'GOMES','COSTA','RIBEIRO','MARTINS','CARVALHO','ALMEIDA','LOPES','SOUSA','FERNANDES',
    'VIEIRA','BARBOSA','ROCHA','DIAS','NASCIMENTO','ANDRADE','MOREIRA','NUNES','MARQUES',
    'MACHADO','MENDES','FREITAS','CARDOSO','RAMOS','MORAES','DE PAULA','CAVALCANTI',
    'TEIXEIRA','PIRES','AZEVEDO','BORGES','CUNHA','MONTEIRO','PINTO','CAMPOS','ARAUJO',
    'CORREIA','MELO','FONSECA','NOGUEIRA','BRAGA','FIGUEIREDO','LUZ','MEDEIROS','GUERRA',
    'XAVIER','LEITE','MOTA','BASTOS','AMARAL','DANTAS','VASCONCELOS','DUARTE','PAIVA',
];

// ── Configurações do CSV ─────────────────────────────────────────────────────
$outputPath = __DIR__ . '/app/funcionarios_teste_700.csv';
$cpfsUsados = [];
$matriculasUsadas = [];
$linhas = [];

// ── Cabeçalho ────────────────────────────────────────────────────────────────
$linhas[] = 'NOME;CPF;MATRICULA;LIMCRED;BLOQUEADO';

// ── Registros ────────────────────────────────────────────────────────────────

// Cenário 1: 650 registros 100% válidos (sem matrícula nos primeiros 100)
for ($i = 1; $i <= 650; $i++) {
    do { $cpf = gerarCpf(); } while (isset($cpfsUsados[$cpf]));
    $cpfsUsados[$cpf] = true;

    $nome      = $prenomes[array_rand($prenomes)] . ' ' . $sobrenomes[array_rand($sobrenomes)] . ' ' . $sobrenomes[array_rand($sobrenomes)];
    $matricula = $i <= 100 ? '' : $i + 1000;  // primeiros 100 sem matrícula
    $limcred   = rand(50, 950) / 10 * 10;      // múltiplo de 10 entre 50 e 950, máx 950 < 999
    $bloqueado = $i % 20 === 0 ? 1 : 0;        // 1 em cada 20 bloqueado

    if ($matricula !== '') {
        $matriculasUsadas[$matricula] = true;
    }

    $linhas[] = "{$nome};{$cpf};{$matricula};{$limcred};{$bloqueado}";
}

// Cenário 2: 10 registros com LIMCRED > 999 → devem ir para partner_errors
for ($i = 651; $i <= 660; $i++) {
    do { $cpf = gerarCpf(); } while (isset($cpfsUsados[$cpf]));
    $cpfsUsados[$cpf] = true;

    $nome    = $prenomes[array_rand($prenomes)] . ' ' . $sobrenomes[array_rand($sobrenomes)];
    $limcred = rand(1000, 2000);  // ← INVÁLIDO: max é 999

    $linhas[] = "{$nome};{$cpf};;{$limcred};0";
}

// Cenário 3: 10 registros com CPF duplicado (já existe no arquivo) → erro
$cpfsParaDuplicar = array_slice(array_keys($cpfsUsados), 0, 10);
for ($i = 0; $i < 10; $i++) {
    $cpfDuplicado = $cpfsParaDuplicar[$i];
    $nome    = $prenomes[array_rand($prenomes)] . ' ' . $sobrenomes[array_rand($sobrenomes)];
    $limcred = rand(100, 500);

    $linhas[] = "{$nome};{$cpfDuplicado};;{$limcred};0";  // ← CPF duplicado
}

// Cenário 4: 10 registros com CPF inválido (sequência simples) → erro
for ($i = 671; $i <= 680; $i++) {
    $nome      = $prenomes[array_rand($prenomes)] . ' ' . $sobrenomes[array_rand($sobrenomes)];
    $cpfInv    = str_pad($i, 11, '0', STR_PAD_LEFT);  // ← CPF inválido matematicamente
    $limcred   = rand(100, 500);

    $linhas[] = "{$nome};{$cpfInv};;{$limcred};0";
}

// Cenário 5: 10 registros com nome inválido (tem número) → erro
for ($i = 681; $i <= 690; $i++) {
    do { $cpf = gerarCpf(); } while (isset($cpfsUsados[$cpf]));
    $cpfsUsados[$cpf] = true;

    $nome    = 'FUNCIONARIO' . $i . ' TESTE';  // ← nome com número, inválido pelo regex
    $limcred = rand(100, 500);

    $linhas[] = "{$nome};{$cpf};;{$limcred};0";
}

// Cenário 6: 10 registros finais 100% válidos (confirma recuperação após erros)
for ($i = 691; $i <= 700; $i++) {
    do { $cpf = gerarCpf(); } while (isset($cpfsUsados[$cpf]));
    $cpfsUsados[$cpf] = true;

    $nome    = $prenomes[array_rand($prenomes)] . ' ' . $sobrenomes[array_rand($sobrenomes)];
    $limcred = rand(100, 800);

    $linhas[] = "{$nome};{$cpf};;{$limcred};0";
}

// ── Salvar arquivo ───────────────────────────────────────────────────────────
$csv = implode("\r\n", $linhas) . "\r\n";

if (!is_dir(dirname($outputPath))) {
    mkdir(dirname($outputPath), 0755, true);
}

file_put_contents($outputPath, $csv);

// ── Relatório ────────────────────────────────────────────────────────────────
$total   = count($linhas) - 1; // -1 para o cabeçalho
$validos = 650 + 10;           // cenários 1 + 6
$erros   = 10 + 10 + 10 + 10; // cenários 2 + 3 + 4 + 5

echo PHP_EOL;
echo "✅ CSV gerado: {$outputPath}" . PHP_EOL;
echo "─────────────────────────────────────────" . PHP_EOL;
echo "Total de registros : {$total}" . PHP_EOL;
echo "─────────────────────────────────────────" . PHP_EOL;
echo "Cenário 1 (linhas   1-650): 650 válidos (sem matrícula nos 100 primeiros)" . PHP_EOL;
echo "Cenário 2 (linhas 651-660):  10 LIMCRED > 999              → partner_errors" . PHP_EOL;
echo "Cenário 3 (linhas 661-670):  10 CPF duplicado no próprio CSV → partner_errors" . PHP_EOL;
echo "Cenário 4 (linhas 671-680):  10 CPF matematicamente inválido → partner_errors" . PHP_EOL;
echo "Cenário 5 (linhas 681-690):  10 nome com número             → partner_errors" . PHP_EOL;
echo "Cenário 6 (linhas 691-700):  10 válidos (recuperação)       → importados" . PHP_EOL;
echo "─────────────────────────────────────────" . PHP_EOL;
echo "Esperado: ~{$validos} importados | ~{$erros} erros" . PHP_EOL;
echo PHP_EOL;
