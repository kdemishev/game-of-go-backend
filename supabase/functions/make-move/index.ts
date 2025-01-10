// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabase } from "../shared/supabase.ts";

Deno.serve(async (req) => {
  const { game_uuid, player_uuid, cell_id } = await req.json();

  const { data: game } = await supabase
    .from("view_game")
    .select("current_move")
    .eq("uuid", game_uuid)
    .single();

  if (game.current_move !== player_uuid) {
    return new Response(JSON.stringify({ error: "It is not your turn!" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { error } = await supabase
    .from("move")
    .insert({ game_uuid, player_uuid, cell_id });

  if (error) {
    console.log("Error inserting move:", error);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/make-move' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
