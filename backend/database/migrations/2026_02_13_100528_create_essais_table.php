<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('essais', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_service');
            $table->string('nom_essais');
            $table->timestamps();
            
            $table->foreign('id_service')
                ->references('id')
                ->on('services')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('essais');
    }
};
