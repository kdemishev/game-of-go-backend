// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabase } from "../shared/supabase.ts";
import { assignStones, checkCaptures, convertToCellId, transformData, visualizeBoard } from "../shared/capture.ts";
import { fetchMoves } from "../shared/data.ts";
import { endOfGame } from "../shared/end-of-game.ts";


Deno.serve(async (req) => {

  try{
  const { game_uuid, player_uuid, cell_id, move_type } = await req.json();

  const { data: game } = await supabase
    .from("view_game")
    .select("*")
    .eq("uuid", game_uuid)
    .single();

  if (game.current_move !== player_uuid) {
    return new Response(JSON.stringify({ error: "It is not your turn!" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  await supabase
  .from("move")
  .insert({ game_uuid, player_uuid, cell_id, move_type });

  if (move_type == "resign"){

    const winData = {
      winner_uuid: player_uuid == game.player1_uuid ? game.player2_uuid : game.player1_uuid,
      reason_of_winning: "resignation"
    };

    const { data } = await supabase
      .from("game")
      .update(winData)
      .eq("uuid", game_uuid)
      .select()
      .single();
  }

  //if it was a second pass to check if the game is over
  if (move_type === "pass") {
    const { data, error } = await supabase
    .from('move')
    .select('*')
    .eq('player_uuid', player_uuid) 
    .order('created_at', { ascending: false }) 
    .limit(2);

    console.log("Data after passing: ", data);

    const isPass = data[1].move_type === "pass" && data[0].move_type === "pass";

    console.log("Is pass: ", isPass);

    if (isPass) {
      const winner_uuid = player_uuid == game.player1_uuid ? game.player2_uuid : game.player1_uuid;
      await endOfGame(game.uuid,winner_uuid);

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  //Capturing part
  const moves = await fetchMoves(game_uuid);

  //console.log("Game: ", game);
  const movesWithStones = assignStones(moves, game);
  //console.log("Board for calculation: ", movesWithStones);

  const dimension = game.board_size;
  const boardForCalculation = transformData(movesWithStones, dimension);
  //console.log("Board for calculation: ", boardForCalculation);

  const capturedGroups = checkCaptures(boardForCalculation, dimension);
  //console.log("Captured Groups: ", capturedGroups);

  //Save the captured groups
  if (capturedGroups.length > 0) {
    console.log("Captured Groups: ", capturedGroups);
    await saveCaptures(capturedGroups[0], game);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
} catch (error) {
  console.log(error);
  return new Response(JSON.stringify({ error: error }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
});

async function saveCaptures(capturedGroups, game) {
  for (const item of capturedGroups) {
    console.log("Captured Item: ", item);
    const record = {
      game_uuid: game.uuid,
      player_uuid: item.stone == 'black' ? game.player2_uuid : game.player1_uuid,
      cell_id: convertToCellId(item),
      move_type: "capture"
    };

    const { data, error } = await supabase
      .from("move")
      .insert(record);
    console.log("save capture: ", error);
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/make-move' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
