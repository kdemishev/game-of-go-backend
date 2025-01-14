import { supabase } from "./supabase.ts";

export const  fetchMoves = async(gameUUID: string) =>{

    const { data, error } = await supabase
      .from("view_move")
      .select("*")
      .eq("game_uuid", gameUUID);
  
    return data;
  }

export const getGame = async(gameUUID:string) =>{
    const { data: game } = await supabase
    .from("view_game")
    .select("*")
    .eq("uuid", gameUUID)
    .single();

    return game;
}
  