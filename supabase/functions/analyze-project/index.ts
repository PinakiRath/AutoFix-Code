import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

interface AnalysisRequest {
  packageJson: PackageJson;
  files: string[];
}

interface AnalysisResult {
  language: string;
  framework: string | null;
  packageManager: string;
  hasTypeScript: boolean;
  availableScripts: string[];
  recommendedCommand: string;
}

function detectFramework(packageJson: PackageJson): string | null {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  if (allDeps.react) return 'react';
  if (allDeps.vue) return 'vue';
  if (allDeps.angular || allDeps['@angular/core']) return 'angular';
  if (allDeps.svelte) return 'svelte';
  if (allDeps.next) return 'next';
  if (allDeps.nuxt) return 'nuxt';
  if (allDeps.express) return 'express';

  return null;
}

function detectLanguage(packageJson: PackageJson, files: string[]): { language: string; hasTypeScript: boolean } {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const hasTypeScript = !!(allDeps.typescript || files.some(f => f.endsWith('.ts') || f.endsWith('.tsx')));
  const language = hasTypeScript ? 'typescript' : 'javascript';

  return { language, hasTypeScript };
}

function getRecommendedCommand(scripts: Record<string, string> = {}): string {
  if (scripts.dev) return 'npm run dev';
  if (scripts.start) return 'npm start';
  if (scripts.test) return 'npm test';
  if (scripts.build) return 'npm run build';
  return 'npm start';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { packageJson, files }: AnalysisRequest = await req.json();

    if (!packageJson) {
      return new Response(
        JSON.stringify({ error: 'Package.json is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { language, hasTypeScript } = detectLanguage(packageJson, files || []);
    const framework = detectFramework(packageJson);
    const availableScripts = Object.keys(packageJson.scripts || {});
    const recommendedCommand = getRecommendedCommand(packageJson.scripts);

    const result: AnalysisResult = {
      language,
      framework,
      packageManager: 'npm',
      hasTypeScript,
      availableScripts,
      recommendedCommand,
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});