import { supabase } from "./supabase.ts";
import { getGame, fetchMoves } from "./data.ts";

const calculateScore = (board: { x: number, y: number, stone: string }[]): { board: { x: number, y: number, stone: string }[] } => {
    let visited = new Set<string>();

    const isTerritory = (x: number, y: number, color: string): boolean => {
        if (x < 0 || y < 0 || x >= 19 || y >= 19) return false;
        const key = `${x},${y}`;
        if (visited.has(key)) return true;
        visited.add(key);

        const cell = board.find(c => c.x === x && c.y === y);
        if (!cell || cell.stone === color) return true;
        if (cell.stone !== 'none') return false;

        return isTerritory(x + 1, y, color) &&
               isTerritory(x - 1, y, color) &&
               isTerritory(x, y + 1, color) &&
               isTerritory(x, y - 1, color);
    };

    for (let cell of board) {
        if (cell.stone === 'none') {
            visited.clear();
            if (isTerritory(cell.x, cell.y, 'black')) {
                cell.stone = 'area_black';
            } else if (isTerritory(cell.x, cell.y, 'white')) {
                cell.stone = 'area_white';
            }
        }
    }

    return { board };
};

export const endOfGame = async (gameUUID: string, winnerUUID: string) => {

    const game = await getGame(gameUUID);
    //Fill The field (white_area, black_area)

    const newRecords = [{
        game_uuid: gameUUID,
        player_uuid: game.player1_uuid,
        cell_id: 'aa',
        move_type: "black_area"
    }, {
        game_uuid: gameUUID,
        player_uuid: game.player2_uuid,
        cell_id: 'ab',
        move_type: "white_area"
    }, {
        game_uuid: gameUUID,
        player_uuid: game.player1_uuid,
        cell_id: 'ac',
        move_type: "black_area"
    }, {
        game_uuid: gameUUID,
        player_uuid: game.player2_uuid,
        cell_id: 'ad',
        move_type: "white_area"
    }];

    const {error } = await supabase
        .from("move")
        .insert(newRecords);

    console.log("save area: ", error);

    // Example board, replace with actual board data
    const board = [
        { x: 0, y: 0, stone: "black" },
        { x: 0, y: 1, stone: "white" },
        { x: 0, y: 2, stone: "black" },
        { x: 1, y: 0, stone: "white" },
        { x: 1, y: 1, stone: "black" },
        { x: 1, y: 2, stone: "white" },
        { x: 2, y: 0, stone: "black" },
        { x: 2, y: 1, stone: "black" },
        { x: 2, y: 2, stone: "white" }
    ];

    const scores = calculateScore(board);
    console.log("Black score: ", scores.black, "White score: ", scores.white);
    console.log("Updated board: ", scores.board);

    //Mark game as finished
    let winData = {
        winner_uuid: winnerUUID,
        reason_of_winning: "end of game: 20 points",
    };

    const { data } = await supabase
        .from("game")
        .update(winData)
        .eq("uuid", game.uuid)
        .select()
        .single();
}


