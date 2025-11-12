<?php

namespace App\Http\Controllers;

use App\Models\TypeWagon;
use Illuminate\Http\Request;

class TypeWagonController extends Controller
{
    public function index()
    {
        return response()->json(TypeWagon::all());
    }

    public function store(Request $request)
    {
        $typeWagon = TypeWagon::create($request->all());
        return response()->json($typeWagon, 201);
    }

    public function update(Request $request, TypeWagon $typeWagon)
    {
        $typeWagon->update($request->all());
        return response()->json($typeWagon);
    }

    public function destroy(TypeWagon $typeWagon)
    {
        $typeWagon->delete();
        return response()->json(null, 204);
    }
}
