// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { captureGroupInTheField } from "../tests/captureGroupInTheField.ts";

Deno.serve(async (req) => {
  const results = [];

  const captureResult = await captureGroupInTheField();

  results.push({ testName: "captureGroupInTheField", result: captureResult});

  return new Response(
    JSON.stringify(results),
    { headers: { "Content-Type": "application/json" } },
  );
})

