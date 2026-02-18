<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Controle extends Model
{
    protected $fillable = ['libelle', 'type', 'frequence'];

    public function controleFours()
    {
        return $this->hasMany(ControleFour::class, 'id_controle');
    }
}
