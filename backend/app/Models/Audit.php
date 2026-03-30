<?php

namespace App\Models;

use OwenIt\Auditing\Models\Audit as BaseAudit;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Audit extends BaseAudit
{
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }
    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }
}
