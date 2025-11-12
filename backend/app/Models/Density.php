<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Density extends Model
{
    use HasFactory;
    protected $table = 'density';
    protected $fillable = ['id_typeWagon', 'id_four', 'id_famille', 'density_value'];

    public function four()
    {
        return $this->belongsTo(Four::class, 'id_four');
    }
    public function type_wagon()
    {
        return $this->belongsTo(TypeWagon::class, 'id_typeWagon', 'id');
    }
    public function famille()
    {
        return $this->belongsTo(Famille::class, 'id_famille');
    }
}
