<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ControleFour extends Model
{
    // use HasFactory;

    protected $table = 'controle_four';

    protected $fillable = [
        'id_controle',
        'id_four',
        'required',
    ];

    public function controle()
    {
        return $this->belongsTo(Controle::class, 'id_controle');
    }

    public function four()
    {
        return $this->belongsTo(Four::class, 'id_four');
    }
}
