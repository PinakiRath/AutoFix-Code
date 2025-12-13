import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FileContent {
  path: string;
  content: string;
}

interface RepairRequest {
  errorLog: string;
  fileTree: string[];
  relevantFiles: FileContent[];
  openaiApiKey: string;
  iteration: number;
}

interface FileFix {
  path: string;
  content: string;
  reason: string;
}

interface RepairResponse {
  fixes: FileFix[];
  analysis: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { errorLog, fileTree, relevantFiles, openaiApiKey, iteration }: RepairRequest = await req.json();

    if (!errorLog || !openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Error log and OpenAI API key are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const systemPrompt = `You are an expert code repair agent. Your job is to analyze runtime or build errors and fix the code.

Rules:
1. Provide ONLY complete file replacements, no partial edits
2. Return valid JSON with this structure: { "fixes": [{ "path": "src/file.ts", "content": "full file content", "reason": "brief explanation" }], "analysis": "error analysis" }
3. Make minimal changes - only fix what's broken
4. Do not add new dependencies unless absolutely necessary
5. Preserve existing code style and structure
6. Focus on the specific error in the log
7. No markdown, no code fences, just raw file content

This is iteration ${iteration} of 5 maximum attempts.`;

    const userPrompt = `Error Log:
${errorLog}

---

File Tree:
${fileTree.join('\n')}

---

Relevant Files:
${relevantFiles.map(f => `\n### ${f.path}\n${f.content}`).join('\n\n')}

---

Analyze the error and provide fixes in valid JSON format.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${error}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const parsedResponse: RepairResponse = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify(parsedResponse),
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