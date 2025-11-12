<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chargements', function (Blueprint $table) {
            //
            $table->unsignedBigInteger('id_typeWagon')->after('id_four')->nullable();

            // Add foreign key constraint
            $table->foreign('id_typeWagon')->references('id')->on('type_wagon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chargements', function (Blueprint $table) {
            //
            $table->dropForeign(['id_typeWagon']);
            $table->dropColumn('id_typeWagon');
        });
    }
};
