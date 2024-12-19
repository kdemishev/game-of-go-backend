// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = await createClient(supabaseUrl, supabaseKey);

export async function fetchMoves(gameUUID: string) {

  const { data, error } = await supabase
    .from("view_move")
    .select("*")
    .eq("game_uuid", gameUUID);

  return data;
}

Deno.serve(async (req) => {
  const { game_uuid } = await req.json()

  console.log("Calculating captures for game:", game_uuid);

  const moves = await fetchMoves(game_uuid);

  if (moves) {

    for (let i = 0; i < 2; i++) {
      const randomValue = Math.floor(Math.random() * moves.length);
      const move = moves[randomValue];

      const { error: insertError } = await supabase.from("move").insert([
        {
          cell_id: move.cell_id,
          player_uuid: move.player_uuid,
          game_uuid: game_uuid,
          move_type: "capture",
        },
      ]);
    }
  }

  return new Response(
    JSON.stringify(game_uuid),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/calculate-captures' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
