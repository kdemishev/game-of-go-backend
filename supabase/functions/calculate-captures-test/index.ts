// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { captureGroupInTheField } from "../tests/captureGroupInTheField";

Deno.serve(async (req) => {
  const results = [];

  //ToDo:
  //1. Run test 
  captureGroupInTheField();
  //2. Write the result of the test in results array as 
  //    {testName: "captureGroupInTheField", result: true}

  return new Response(
    JSON.stringify(results),
    { headers: { "Content-Type": "application/json" } },
  )
})

