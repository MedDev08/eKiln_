<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('details_controles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('controle_id')->constrained('controles')->onDelete('cascade');
            $table->foreignId('four_id')->constrained('fours')->onDelete('cascade');
            $table->string('valeur')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('details_controles');
    }
};
