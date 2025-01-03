
import { setupGameWithCaptureGroupInTheField } from "./testSetup.ts";
import {assignStones, checkCaptures, transformData} from "../shared/capture.ts"
import { supabase } from "../shared/supabase.ts";
import { fetchMoves } from "../shared/data.ts";
import { PLAYER1_UUID } from "../shared/utils.ts";

export async function captureGroupInTheField(){

    const game_uuid = await setupGameWithCaptureGroupInTheField();
    
    const { error: moveError } = await supabase.from('move').insert({
        game_uuid: game_uuid,
        cell_id:'ec',
        player_uuid: PLAYER1_UUID,
    });

    const { data: game, error: gameError } = await supabase
        .from("game")
        .select("*")
        .eq("uuid", game_uuid)
        .single();
    
    const moves = await fetchMoves(game_uuid);
      
    const movesWithStones = assignStones(moves, game);
    
    const dimension = game.board_size;
    const boardForCalculation = transformData(movesWithStones, dimension);
    
    const captured = checkCaptures(boardForCalculation, 9);

    const exeptedCaptured =[ 
      [
        {x: 5, y: 4, stone: "white"},
        {x: 5, y: 5, stone: "white"},
        {x: 5, y: 6, stone: "white"}
      ]
    ];
    
    const equalCaptured = (obj1, obj2)=>{
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    if (equalCaptured(exeptedCaptured, captured))
      return true;
    else
      return false;
}