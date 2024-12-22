// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import * as axiod from "https://deno.land/x/axiod@0.26.2/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const NEXT_PUBLIC_SUPABASE_URL = "https://ehdrnfjnmzwjvteecbkj.supabase.co";
// const NEXT_PUBLIC_SUPABASE_ANON_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZHJuZmpubXp3anZ0ZWVjYmtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDUyMDk4MSwiZXhwIjoyMDQ2MDk2OTgxfQ.xmhdhENpDEI-FgGbSo5h2tjw2a1cpJMTJse0B_DWvVI";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  try {
    const { file } = await req.json();

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Parameter file is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await axiod.default.get(file, { responseType: "text" });

    if (!response.data) {
      return new Response(JSON.stringify({ error: "Error get file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sgfContent = response.data;

    console.log(sgfContent);

    const rawMoves = sgfContent.match(/;[WB]\[[a-z]{2}\]/g);

    if (!rawMoves) {
      return new Response(JSON.stringify({ error: "No moves found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const gameUuid = "479592fc-74ec-44d0-a042-f25459f50567";
    const player1Uuid = "63a9e658-904d-4a32-88df-6514d1d7b2da";
    const player2Uuid = "7e4971af-a5a2-4287-9460-d84bb3e54aae";

    const moves = rawMoves.map((move, index) => {
      const playerUuid = move.startsWith(";W") ? player2Uuid : player1Uuid;
      const cellId = move.slice(3, -1);
      const step = index + 1;

      return {
        game_uuid: gameUuid,
        player_uuid: playerUuid,
        cell_id: cellId,
        step,
      };
    });

    for (const move of moves) {
      const { data, error } = await supabase
        .from("move")
        .insert([
          {
            game_uuid: move.game_uuid,
            player_uuid: move.player_uuid,
            cell_id: move.cell_id,
          },
        ])
        .select();

      if (error) {
        console.error("Error inserting move:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.log("Move inserted:", data);
    }

    return new Response(JSON.stringify({ "Move inserted ": true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sgf-parser' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
