<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProactiveRule\StoreProactiveRuleRequest;
use App\Http\Requests\ProactiveRule\UpdateProactiveRuleRequest;
use App\Http\Requests\ProactiveRule\PreviewTemplateRequest;
use App\Http\Resources\ProactiveRuleResource;
use App\Models\ProactiveRule;
use App\Services\TemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProactiveRuleController extends Controller
{
    protected TemplateService $templateService;

    public function __construct(TemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    /**
     * Display a listing of proactive messaging rules.
     * GET /proactive-rules
     */
    public function index(): AnonymousResourceCollection
    {
        $rules = ProactiveRule::orderBy('created_at', 'desc')->get();

        return ProactiveRuleResource::collection($rules);
    }

    /**
     * Store a newly created proactive rule.
     * POST /proactive-rules
     */
    public function store(StoreProactiveRuleRequest $request): JsonResponse
    {
        $rule = ProactiveRule::create([
            'trigger_type' => $request->validated('trigger_type'),
            'trigger_config' => $request->validated('trigger_config'),
            'message_template' => $request->validated('message_template'),
            'is_active' => $request->validated('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Proactive rule created successfully',
            'data' => new ProactiveRuleResource($rule),
        ], 201);
    }

    /**
     * Display the specified proactive rule.
     * GET /proactive-rules/{id}
     */
    public function show(string $id): ProactiveRuleResource
    {
        $rule = ProactiveRule::findOrFail($id);

        return new ProactiveRuleResource($rule);
    }

    /**
     * Update the specified proactive rule.
     * PATCH /proactive-rules/{id}
     */
    public function update(UpdateProactiveRuleRequest $request, string $id): JsonResponse
    {
        $rule = ProactiveRule::findOrFail($id);
        $rule->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Proactive rule updated successfully',
            'data' => new ProactiveRuleResource($rule->fresh()),
        ]);
    }

    /**
     * Deactivate a proactive rule.
     * POST /proactive-rules/{id}/deactivate
     */
    public function deactivate(string $id): JsonResponse
    {
        $rule = ProactiveRule::findOrFail($id);
        $rule->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Proactive rule deactivated successfully',
            'data' => new ProactiveRuleResource($rule->fresh()),
        ]);
    }

    /**
     * Render a template with sample variables for testing.
     * POST /proactive-rules/preview
     */
    public function preview(PreviewTemplateRequest $request): JsonResponse
    {
        $template = $request->validated('message_template');
        $variables = $request->validated('variables', []);

        $rendered = $this->templateService->renderTemplate($template, $variables);
        $validation = $this->templateService->validateVariables($template, $variables);

        return response()->json([
            'success' => true,
            'data' => [
                'original_template' => $template,
                'rendered_message' => $rendered,
                'variables_used' => $variables,
                'validation' => $validation,
            ],
        ]);
    }

    /**
     * Remove the specified proactive rule.
     * DELETE /proactive-rules/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $rule = ProactiveRule::findOrFail($id);
        $rule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Proactive rule deleted successfully',
        ]);
    }
}
