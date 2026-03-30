<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Essai extends Model
{
    use HasFactory;

    protected $table = 'essais';

    protected $fillable = [
        'id_service',
        'nom_essais',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class, 'id_service', 'id');
    }

    public function details()
    {
        return $this->hasMany(DetailEssai::class, 'id_essais', 'id');
    }
}
