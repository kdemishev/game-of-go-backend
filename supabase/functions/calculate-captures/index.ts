// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { supabase } from "../shared/supabase.ts";
import { fetchMoves } from "../shared/data.ts";
import { assignStones, checkCaptures, convertToCellId, transformData, visualizeBoard } from "../shared/capture.ts";

//const supabaseUrl = Deno.env.get("SUPABASE_URL");
//const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
  const { game_uuid } = await req.json()

  const { data:game, error } = await supabase
    .from("game")
    .select("*")
    .eq("uuid", game_uuid)
    .single();

  const moves = await fetchMoves(game_uuid);
  
  const movesWithStones = assignStones(moves, game);

  const dimension = game.board_size;
  const boardForCalculation = transformData(movesWithStones, dimension);

  //Draw the board
  visualizeBoard(boardForCalculation, dimension);

  const capturedGroups = checkCaptures(boardForCalculation, dimension);
  
  console.log("Captured Groups: ", capturedGroups);
  //Draw the board with captured groups
  visualizeBoard(boardForCalculation, dimension, capturedGroups);

  //Save the captured groups
  if (capturedGroups.length > 0)
    await saveCaptures(capturedGroups[0],game);

  return new Response(
    JSON.stringify(game_uuid),
    { headers: { "Content-Type": "application/json" } },
  )
});

async function saveCaptures(capturedGroups,game) {
  for (const item of capturedGroups) {
      console.log("Captured Item: ", item);
      const record = {  game_uuid: game.uuid, 
                        player_uuid: item.stone == 'black' ? game.player1_uuid : game.player2_uuid,
                        cell_id: convertToCellId (item),
                        move_type: "capture"};

      const {data, error} = await supabase
      .from("move")
      .insert(record);
      console.log("save capture: ", error);
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/calculate-captures' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
