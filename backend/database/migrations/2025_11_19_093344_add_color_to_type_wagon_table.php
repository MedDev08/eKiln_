<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('type_wagon', function (Blueprint $table) {
            $table->string('color', 20)->nullable()->after('description');
        });
    }

    public function down()
    {
        Schema::table('type_wagon', function (Blueprint $table) {
            $table->dropColumn('color');
        });
    }
};
