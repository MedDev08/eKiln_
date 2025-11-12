<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeWagon extends Model
{
    use HasFactory;
    protected $table = 'type_wagon';
    protected $fillable = ['type_wagon', 'description'];
}
