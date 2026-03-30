<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $table = 'services';

    protected $fillable = [
        'nom_service',
        'color',
    ];

    public function essais()
    {
        return $this->hasMany(Essai::class, 'id_service', 'id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'id_service', 'id');
    }
}
