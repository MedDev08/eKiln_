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
        Schema::create('density', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_typeWagon');
            $table->unsignedBigInteger('id_four');
            $table->unsignedBigInteger('id_famille');
            $table->decimal('density_value', 8, 2);
            $table->timestamps();

            $table->foreign('id_typeWagon')->references('id')->on('type_wagon');
            $table->foreign('id_four')->references('id_four')->on('fours');
            $table->foreign('id_famille')->references('id_famille')->on('familles');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('density');
    }
};
