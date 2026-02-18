<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailControle extends Model
{
    protected $table = 'details_controles';
    protected $fillable = ['id_controle_four', 'id_user', 'valeur'];

    public function ControleFour()
    {
        return $this->belongsTo(ControleFour::class, 'id_controle_four');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
