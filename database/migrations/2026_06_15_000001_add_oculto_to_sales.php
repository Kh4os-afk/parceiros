<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('sales', 'oculto')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->unsignedTinyInteger('oculto')->default(0)->after('dtdevol');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('sales', 'oculto')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('oculto');
        });
    }
};
