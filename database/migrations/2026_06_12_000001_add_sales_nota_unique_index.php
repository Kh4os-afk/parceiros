<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasIndex('sales', 'sales_nota_unique')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->unique(['codfilial', 'caixa', 'numnota'], 'sales_nota_unique');
        });
    }

    public function down(): void
    {
        if (! Schema::hasIndex('sales', 'sales_nota_unique')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->dropUnique('sales_nota_unique');
        });
    }
};
