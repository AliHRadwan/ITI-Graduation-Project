<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     * GET /departments
     */
    public function index(): AnonymousResourceCollection
    {
        $departments = Department::orderBy('name')
            ->paginate((int) request()->input('per_page', 5));

        return DepartmentResource::collection($departments);
    }

    /**
     * Store a newly created department.
     * POST /departments
     */
    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create([
            'name' => $request->validated('name'),
            'is_active' => $request->validated('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Department created successfully',
            'data' => new DepartmentResource($department),
        ], 201);
    }

    /**
     * Display the specified department.
     * GET /departments/{id}
     */
    public function show(string $id): DepartmentResource
    {
        $department = Department::findOrFail($id);

        return new DepartmentResource($department);
    }

    /**
     * Update the specified department.
     * PATCH /departments/{id}
     */
    public function update(UpdateDepartmentRequest $request, string $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $department->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully',
            'data' => new DepartmentResource($department->fresh()),
        ]);
    }

    /**
     * Deactivate a department.
     * POST /departments/{id}/deactivate
     */
    public function deactivate(string $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        
        $department->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Department deactivated successfully',
            'data' => $department->fresh(),
        ]);
    }

    /**
     * Remove the specified department.
     * DELETE /departments/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Department deleted successfully',
        ]);
    }
}
