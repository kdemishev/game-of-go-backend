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
   export function checkCaptures(board, size) {
    const directions = [
        { dx: 0, dy: 1 },  // Up
        { dx: 1, dy: 0 },  // Right
        { dx: 0, dy: -1 }, // Down
        { dx: -1, dy: 0 }  // Left
    ];
  
    function getCell(x, y) {
        return board.find(cell => cell.x === x && cell.y === y);
    }
  
    function hasLiberty(group) {
        const visited = new Set(group.map(cell => `${cell.x},${cell.y}`));
        const queue = [...group];
  
        while (queue.length > 0) {
            const cell = queue.pop();
  
            for (const { dx, dy } of directions) {
                const nx = cell.x + dx;
                const ny = cell.y + dy;
                const neighbor = getCell(nx, ny);
  
                if (neighbor && !visited.has(`${nx},${ny}`)) {
                    if (neighbor.stone === "none") {
                        return true; // Found a reachable liberty
                    }
                    if (neighbor.stone === cell.stone) {
                        queue.push(neighbor);
                    }
                    visited.add(`${nx},${ny}`);
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
            group.forEach(stone => processed.add(`${stone.x},${stone.y}`));
  
            if (!hasLiberty(group)) {
                capturedGroups.push(group);
            }
        }
    }
  
    return capturedGroups;
  }
  
  export function visualizeBoard(board, size, capturedGroups=[]) {
  
    const boardMatrix = Array.from({ length: size }, () => Array(size).fill("."));
  
    for (const cell of board) {
        if (cell.stone === "black") boardMatrix[cell.y - 1][cell.x - 1] = "B";
        else if (cell.stone === "white") boardMatrix[cell.y - 1][cell.x - 1] = "W";
    }
  
    for (const group of capturedGroups) {
        for (const cell of group) {
            boardMatrix[cell.y - 1][cell.x - 1] = "X"; // Mark captured stones
        }
    }
  
    for (const row of boardMatrix) {
        console.log(row.join(" "));
    }
  }