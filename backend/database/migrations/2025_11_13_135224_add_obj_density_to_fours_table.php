<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fours', function (Blueprint $table) {
            if (!Schema::hasColumn('fours', 'obj_density')) {
                $table->float('obj_density')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('fours', function (Blueprint $table) {
            if (Schema::hasColumn('fours', 'obj_density')) {
                $table->dropColumn('obj_density');
            }
        });
    }
};
