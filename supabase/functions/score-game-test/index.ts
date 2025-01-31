// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { calculateScore, endOfGame } from '../shared/end-of-game.ts';

import { setupGameWithCaptureGroupInTheField } from '../tests/testSetup.ts';
import { supabase } from "../shared/supabase.ts";
import { fetchMoves } from "../shared/data.ts";
import { PLAYER1_UUID } from "../shared/utils.ts";

Deno.serve(async (req) => {

  const game_uuid = await setupGameWithCaptureGroupInTheField('prepare_end_of_game_dead_stones');
  await endOfGame(game_uuid);
  

  return new Response(
    JSON.stringify({game_uuid:game_uuid}),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/score-game-test' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
