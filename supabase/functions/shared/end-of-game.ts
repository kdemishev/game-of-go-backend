import { supabase } from "./supabase.ts";
import { getGame, fetchMoves } from "./data.ts";
import { assignStones, convertFromSGFToCell, transformSGFBoardToMatrix } from "./capture.ts"

function findDeadStones(cells) {
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0] // right, down, left, up
    ];
  
    const isInsideBoard = (x, y) => cells.some(cell => cell.x === x && cell.y === y);
  
    function getCell(x, y) {
      return cells.find(cell => cell.x === x && cell.y === y);
    }
  
    function floodFill(x, y) {
      const queue = [[x, y]];
      const region = [];
      const borderColors = new Set();
      let isSurrounded = true;
      const visited = new Set();
  
      while (queue.length > 0) {
        const [cx, cy] = queue.pop();
        const key = `${cx},${cy}`;
  
        if (visited.has(key)) continue;
        visited.add(key);
        region.push({ x: cx, y: cy });
  
        for (const [dx, dy] of directions) {
          const nx = cx + dx;
          const ny = cy + dy;
          const neighbor = getCell(nx, ny);
  
          if (!isInsideBoard(nx, ny)) {
            isSurrounded = false;
            continue;
          }
  
          if (neighbor.stone === "none" && !visited.has(`${nx},${ny}`)) {
            queue.push([nx, ny]);
          } else if (neighbor.stone !== "none") {
            borderColors.add(neighbor.stone === "black" ? 1 : 2);
          }
        }
      }
  
      return { region, borderColors, isSurrounded };
    }
  
    const deadStones = { black: [], white: [] };
  
    cells.forEach(cell => {
      if (cell.stone === "none") {
        const { region, borderColors, isSurrounded } = floodFill(cell.x, cell.y);
  
        if (isSurrounded && borderColors.size === 1) {
          const [owner] = borderColors;
          const deadColor = owner === 1 ? "white" : "black";
  
          region.forEach(({ x, y }) => {
            directions.forEach(([dx, dy]) => {
              const neighbor = getCell(x + dx, y + dy);
  
              if (neighbor.stone === deadColor) {
                if (deadColor === "black") {
                  deadStones.black.push({ x: neighbor.x, y: neighbor.y });
                } else {
                  deadStones.white.push({ x: neighbor.x, y: neighbor.y });
                }
              }
            });
          });
        }
      }
    });
  
    return deadStones;
  }

export const calculateScore = (board: { x: number, y: number, stone: string }[], dimension: number): { board: { x: number, y: number, stone: string }[] } => {
    let visited = new Set<string>();

    const isTerritory = (x: number, y: number, color: string): boolean => {
        if (x < 1 || y < 1 || x > dimension || y > dimension) return true;
        const key = `${x},${y}`;

        if (visited.has(key)) return true;
        visited.add(key);

        const cell = board.find(c => c.x === x && c.y === y);
        if (!cell) return false;
        if (cell.stone === color) return true;
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
                visited.forEach(key => {
                    const [x, y] = key.split(',').map(Number);
                    const visitedCell = board.find(c => c.x === x && c.y === y);
                    if (visitedCell && visitedCell.stone !== 'black') {
                        visitedCell.stone = 'black_area';
                    }
                });
            } else {
                visited.clear();

                if (isTerritory(cell.x, cell.y, 'white')) {
                    visited.forEach(key => {
                        const [x, y] = key.split(',').map(Number);
                        const visitedCell = board.find(c => c.x === x && c.y === y);
                        if (visitedCell && visitedCell.stone !== 'white') {
                            visitedCell.stone = 'white_area';
                        }
                    });
                }
            }
        }
    }

    return { board };
};

export const endOfGame = async (gameUUID: string) => {

    console.log("End of game");

    const game = await getGame(gameUUID);

    const moves = await fetchMoves(gameUUID);

    const movesWithStones = assignStones(moves, game);

    const dimension = game.board_size;
    const boardForCalculation = transformSGFBoardToMatrix(movesWithStones, dimension);

   // console.log(boardForCalculation);

   const deadStones = findDeadStones(boardForCalculation);
   console.log("deadStones:",deadStones);

    const endOfGame = calculateScore(boardForCalculation, dimension);

    let blackPoints = game.player1_captures;
    let whitePoints = game.player2_captures + game.komi;

    for (const item of endOfGame.board) {
        if (item.stone == 'white_area' || item.stone == 'black_area') {
            if (item.stone == 'white_area') {
                whitePoints++;
            } else {
                blackPoints++;
            }
            const record = {
                game_uuid: game.uuid,
                player_uuid: item.stone == 'black_area' ? game.player1_uuid : game.player2_uuid,
                cell_id: convertToCellId(item),
                move_type: item.stone
            };
            const { data, error } = await supabase
                .from("move")
                .insert(record);
        }
    }

    //Mark game as finished
    let winData = {
        winner_uuid: blackPoints > whitePoints ? game.player1_uuid : game.player2_uuid,
        reason_of_winning: `by +${Math.abs(blackPoints - whitePoints)} points`,
        current_move: null
    };

    const { data } = await supabase
        .from("game")
        .update(winData)
        .eq("uuid", game.uuid)
        .select()
        .single();
}