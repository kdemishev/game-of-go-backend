
import { supabase } from '../shared/supabase.ts';
import { PLAYER1_UUID, PLAYER2_UUID } from '../shared/utils.ts';

export async function setupGameWithCaptureGroupInTheField() : Promise<string>{

    const { data: gameData, error: gameError } = await supabase.from("game").insert({
        created_at: new Date().toISOString().replace("T", " ").replace("Z", ""),
        is_active: true,
        board_size: 9,
        player1_uuid: PLAYER1_UUID,
        player2_uuid: PLAYER2_UUID
    }).select().single();
    
    const { data: prepareData, error: prepareError } = await supabase.rpc('call_prepare_group_middle', { game_uuid_input: gameData.uuid });

    return gameData.uuid as string;
}
