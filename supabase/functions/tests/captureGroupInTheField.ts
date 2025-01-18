
import { setupGameWithCaptureGroupInTheField } from "./testSetup.ts";
import {assignStones, checkCaptures,getCapturedStones, transformData} from "../shared/capture.ts"
import { supabase } from "../shared/supabase.ts";
import { fetchMoves } from "../shared/data.ts";
import { PLAYER1_UUID } from "../shared/utils.ts";

export async function captureGroupInTheField(procedure: string, cellId: string, exeptedCaptured: { x: number; y: number; stone: string; }[][]){

    const game_uuid = await setupGameWithCaptureGroupInTheField(procedure);
    
    const { error: moveError } = await supabase.from('move').insert({
        game_uuid: game_uuid,
        cell_id: cellId,
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
    
    const captured = checkCaptures(boardForCalculation, dimension);
    
    const equalCaptured = (obj1, obj2) => {
      console.log("equalCaptured: ", obj1, obj2);

      if (obj1.length !== obj2.length) return false;
    
      const sortArray = (arr) =>
        arr.map((group) =>
          group
            .map((item) => JSON.stringify(item))
            .sort()
        ).sort();
    
      const sortedObj1 = sortArray(obj1);
      const sortedObj2 = sortArray(obj2);
    
      return JSON.stringify(sortedObj1) === JSON.stringify(sortedObj2);
    };

    if (equalCaptured(exeptedCaptured, captured))
      return true;
    else
      return false;
}