import { supabase } from "./supabase.ts";

export async function fetchMoves(gameUUID: string) {

    const { data, error } = await supabase
      .from("view_move")
      .select("*")
      .eq("game_uuid", gameUUID);
  
    return data;
  }