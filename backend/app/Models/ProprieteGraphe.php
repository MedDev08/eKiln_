<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProprieteGraphe extends Model
{
    protected $table = 'propriete_graphe';

    protected $fillable = [
        'id_four',
        'V1',
        'V2',
        'color'
    ];

    public function four()
    {
        return $this->belongsTo(Four::class, 'id_four');
    }
}
