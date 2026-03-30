<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    // Dans User.php
    protected $table = 'users'; // si votre table s'appelle 'users'
    protected $primaryKey = 'id_user';

    protected $fillable = [
        'matricule',
        'nom',
        'prenom',
        'password',
        'role',
        'id_service'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
    public function polyvalences()
    {
        return $this->hasMany(Polyvalence::class, 'id_user', 'id_user')
            ->select('id_polyvalence', 'id_user', 'id_famille');
    }
    public function service()
    {
        return $this->belongsTo(Service::class, 'id_service');
    }
}
