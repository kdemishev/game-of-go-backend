import { ICell } from "./types.ts";

export function convertFromCellToSFG(position) {
    const xLetter = String.fromCharCode(96 + position.x + (position.x > 8 ? 1 : 0)); // Convert x to letter (a, b, c, etc.)
    const yLetter = String.fromCharCode(96 + position.y + (position.y > 8 ? 1 : 0)); // Skip 'I' if y > 8
    return xLetter + yLetter;
}

export function convertFromSGFToCell(value: string): ICell {
    const alphabet = 'abcdefghjklmnopqrstuvwxyz'; // Skipping 'i'

    const x = alphabet.indexOf(value[0]) + 1;
    const y = alphabet.indexOf(value[1]) + 1;

    return { x, y, stone: '' } as ICell;
}

// Create a board represenation as black / white / none
// to abstract the from palyers
export function assignStones(moves, game) {
    return moves.map(move => ({
        ...move,
        stone: move.player_uuid == game.player1_uuid ? "black" : "white"
    }));
}

//Transform SGF to Matrix
export function transformSGFBoardToMatrix(data, dimension) {
    const board: ICell[] = [];

    for (let x = 1; x <= dimension; x++) {
        for (let y = 1; y <= dimension; y++) {
            let cellLabel = String.fromCharCode(96 + (x > 8 ? x+1 :x)) + String.fromCharCode(96 + (y > 8 ? y+1 :y));
            const match = data.find(item => item.cell_id === cellLabel);

            board.push({
                x: x,
                y: y,
                stone: match ? match.stone : "none"
            });
        }
    }

    return board;
}



// Define a function to check for captures on a Go board
export function checkCaptures(board, lastMove) {

    const lastMoveCell = convertFromSGFToCell(lastMove);

    const directions = [
        { dx: 0, dy: 1 },  // Up
        { dx: 1, dy: 0 },  // Right
        { dx: 0, dy: -1 }, // Down
        { dx: -1, dy: 0 }  // Left
    ];

    // Helper to find a cell on the board
    function getCell(x, y) {
        return board.find(cell => cell.x === x && cell.y === y);
    }

    // Helper to determine if a group has any liberties
    function hasLiberty(group) {
        const visited = new Set();
        const queue = [...group];

        while (queue.length > 0) {
            const cell = queue.pop();

            for (const { dx, dy } of directions) {
                const nx = cell.x + dx;
                const ny = cell.y + dy;
                const neighbor = getCell(nx, ny);

                if (neighbor) {
                    if (neighbor.stone === "none") {
                        return true; // Found a liberty
                    }
                    if (neighbor.stone === cell.stone && !visited.has(`${nx},${ny}`)) {
                        queue.push(neighbor);
                        visited.add(`${nx},${ny}`);
                    }
                }
            }
        }

        return false; // No liberties found
    }

    // Helper to get all stones in the same group
    function getGroup(cell): ICell[] {
        const color = cell.stone;
        const group: ICell[] = [];
        const queue = [cell];
        const visited = new Set([`${cell.x},${cell.y}`]);

        while (queue.length > 0) {
            const current = queue.pop();
            group.push(current);

            for (const { dx, dy } of directions) {
                const neighbor = getCell(current.x + dx, current.y + dy);
                if (
                    neighbor &&
                    neighbor.stone === color &&
                    !visited.has(`${neighbor.x},${neighbor.y}`)
                ) {
                    queue.push(neighbor);
                    visited.add(`${neighbor.x},${neighbor.y}`);
                }
            }
        }

        return group;
    }

    const capturedGroups: ICell[][] = [];
    const processed = new Set();
    processed.add(`${lastMoveCell.x},${lastMoveCell.y}`);

    for (const cell of board) {
        if (cell.stone !== "none" && !processed.has(`${cell.x},${cell.y}`)) {
            const group = getGroup(cell);
            group.forEach(stone => processed.add(`${stone.x},${stone.y}`));

            if (!hasLiberty(group)) {
                capturedGroups.push(group); // Add the captured stones
            }
        }
    }

    return capturedGroups;
}




