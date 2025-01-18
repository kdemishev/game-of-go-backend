// Our code
export function convertToCellId(position) {
    const xLetter = String.fromCharCode(96 + position.x); // Convert x to letter (a, b, c, etc.)
    const yLetter = String.fromCharCode(96 + position.y + (position.y > 8 ? 1 : 0)); // Skip 'I' if y > 8
    console.log("convertToCellId: ", xLetter + yLetter);
    return xLetter + yLetter;
  }
  
  export function assignStones(moves, game) {
    return moves.map(move => ({
        ...move,
        stone: move.player_uuid == game.player1_uuid ? "black" : "white"
    }));
  }
  
  export function transformData(data, dimension) {
    const board = [];
  
    for (let x = 1; x <= dimension; x++) {
        for (let y = 1; y <= dimension; y++) {
            let cellLabel = String.fromCharCode(96 + x) + String.fromCharCode(96 + y);
            cellLabel = cellLabel.replaceAll("i", "j");// will not work for boards more than 19
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
// Define a function to check for captures on a Go board
// Define a function to check for captures on a Go board
// Define a function to check for captures on a Go board
export function checkCaptures(board, size) {
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
    function getGroup(cell) {
        const color = cell.stone;
        const group = [];
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

    const capturedGroups = [];
    const processed = new Set();

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

export function getCapturedStones(board, size) {
    const directions = [
        { dx: 0, dy: 1 },  // Up
        { dx: 1, dy: 0 },  // Right
        { dx: 0, dy: -1 }, // Down
        { dx: -1, dy: 0 }  // Left
    ];

    function getCell(x, y) {
        if (x < 1 || x > size || y < 1 || y > size) return null; // Check boundaries
        return board.find(cell => cell.x === x && cell.y === y);
    }

    function hasLiberty(group) {
        //const visited = new Set(group.map(cell => `${cell.x},${cell.y}`));

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
                        //queue.push(neighbor);
                        visited.add(`${nx},${ny}`);
                    }
                }
            }
        }

        return false; // No liberties found
    }

    function getGroup(cell) {
        const color = cell.stone;
        const group = [];
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

    const capturedGroups = [];
    const processed = new Set();

    for (const cell of board) {
        if (cell.stone !== "none" && !processed.has(`${cell.x},${cell.y}`)) {
            const group = getGroup(cell);
            console.log("group: ", group);
            group.forEach(stone => processed.add(`${stone.x},${stone.y}`));
            const liberties = hasLiberty(group);
            //console.log("liberties: ", liberties);
            if (!liberties) {
                capturedGroups.push(group); // Add the captured stones
            }
        }
    }

    return capturedGroups;
}




