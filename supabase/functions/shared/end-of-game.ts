import { supabase } from "./supabase.ts";

export const endOfGame = async (gameUUID:string) => {
    const supabase = await createClient();

    const game = await getGame(gameUUID);
    let winData = {};

    winData = {
        winner_uuid: game.player2_uuid,
        reason_of_winning: "end of game: 20 points",
    };

    const { data } = await supabase
        .from("game")
        .update(winData)
        .eq("uuid", game.uuid)
        .select()
        .single();
}