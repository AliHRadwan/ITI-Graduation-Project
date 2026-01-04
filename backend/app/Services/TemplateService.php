<?php

namespace App\Services;

use App\Models\ProactiveRule;

class TemplateService
{
    /**
     * Render a template with variables.
     */
    public function renderTemplate(string $template, array $variables = []): string
    {
        $rendered = $template;

        foreach ($variables as $key => $value) {
            // Support multiple placeholder formats
            $rendered = str_replace([
                '{{' . $key . '}}',
                '{{ ' . $key . ' }}',
                '{' . $key . '}',
            ], $value, $rendered);
        }

        return $rendered;
    }

    /**
     * Extract variable names from a template.
     */
    public function extractVariables(string $template): array
    {
        preg_match_all('/\{\{?\s*(\w+)\s*\}?\}/', $template, $matches);
        return array_unique($matches[1] ?? []);
    }

    /**
     * Validate that all required variables are provided.
     */
    public function validateVariables(string $template, array $variables): array
    {
        $required = $this->extractVariables($template);
        $provided = array_keys($variables);
        $missing = array_diff($required, $provided);

        return [
            'valid' => empty($missing),
            'missing' => array_values($missing),
            'required' => $required,
        ];
    }
}
