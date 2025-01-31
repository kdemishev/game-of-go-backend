// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { getGame, fetchMoves } from "../shared/data.ts";

Deno.serve(async (req) => {
  const { game_uuid, player_uuid } = await req.json();

  const [game, moves] = await Promise.all([
    getGame(game_uuid),
    fetchMoves(game_uuid)
  ]);

  const convertMoveToCell = async (move, player1_uuid: string, player2_uuid: string) => {
    const cell = {
      cell_id: move.cell_id,
      move: move.move_type != null ? move.move_type : move.player_uuid === player1_uuid ? 'black' : 'white',
      special: null
    };

    return cell;
  }

  const cells = await Promise.all(moves.map(move => convertMoveToCell(move, game.player1_uuid, game.player2_uuid)));

  console.log(cells);

  //To return 
  // 1) game
  // 2) board for the player. Sotones should be marker as 
  // black, white, black_area, white_area, none, suicide

  // 1) fetch moves
  // 2) put stone markers
  // 3) check where is suicide
  // 4) check where is KO

  const result = {
    uuid: game.uuid,
    board_size: game.board_size,
    player1_uuid: game.player1_uuid,
    player2_uuid: game.player2_uuid,
    player1: game.player1,
    player2: game.player2,
    player1_timer: game.player1_timer,
    player2_timer: game.player2_timer,
    current_move: game.current_move,
    watchers: game.watchers,
    winner: null,
    cells: cells
  };

  return new Response(
    JSON.stringify(result),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetch-game' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
