import { ExerciseBlockState } from './types';

interface Point {
  x: number;
  y: number;
}

const PADDING = 50;
const GRID_STEP = 50;
const CANVAS_SIZE = 3000;

/**
 * Finds a free position for a new block using an Occupancy Grid.
 * Optimization: Uses a Uint8Array grid where each cell represents a 50x50 area.
 * This allows O(1) checks for occupancy relative to N (number of existing blocks),
 * ensuring performance remains stable even with thousands of blocks.
 */
export function findFreePosition(
  prevBlocks: ExerciseBlockState[],
  newBlockWidth: number,
  newBlockHeight: number
): Point {
  const GRID_ROWS = Math.ceil(CANVAS_SIZE / GRID_STEP);
  const GRID_COLS = Math.ceil(CANVAS_SIZE / GRID_STEP);
  // 0 = free, 1 = occupied
  const grid = new Uint8Array(GRID_ROWS * GRID_COLS);

  // Mark occupied cells
  for (const b of prevBlocks) {
    const startX = b.x - PADDING;
    const endX = b.x + b.width + PADDING;
    const startY = b.y - PADDING;
    const endY = b.y + b.height + PADDING;

    const minGx = Math.max(0, Math.floor(startX / GRID_STEP));
    const maxGx = Math.min(GRID_COLS - 1, Math.floor((endX - 1) / GRID_STEP));
    const minGy = Math.max(0, Math.floor(startY / GRID_STEP));
    const maxGy = Math.min(GRID_ROWS - 1, Math.floor((endY - 1) / GRID_STEP));

    for (let gy = minGy; gy <= maxGy; gy++) {
      const rowOffset = gy * GRID_COLS;
      for (let gx = minGx; gx <= maxGx; gx++) {
        grid[rowOffset + gx] = 1;
      }
    }
  }

  const reqColsW = Math.ceil(newBlockWidth / GRID_STEP);
  const reqRowsH = Math.ceil(newBlockHeight / GRID_STEP);

  const startG = Math.floor(PADDING / GRID_STEP);

  for (let gy = startG; gy <= GRID_ROWS - reqRowsH; gy++) {
     for (let gx = startG; gx <= GRID_COLS - reqColsW; gx++) {
         let occupied = false;

         checkLoop:
         for (let cy = 0; cy < reqRowsH; cy++) {
             const checkRowOffset = (gy + cy) * GRID_COLS;
             for (let cx = 0; cx < reqColsW; cx++) {
                 if (grid[checkRowOffset + gx + cx] === 1) {
                     occupied = true;
                     gx += cx; // Optimization: skip past blockage
                     break checkLoop;
                 }
             }
         }

         if (!occupied) {
             return { x: gx * GRID_STEP, y: gy * GRID_STEP };
         }
     }
  }

  return { x: PADDING, y: PADDING };
}
