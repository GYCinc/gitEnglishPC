import { ExerciseBlockState } from './types';

interface Point {
  x: number;
  y: number;
}

const PADDING = 50;
const GRID_STEP = 50;
const CANVAS_SIZE = 3000;
const BIN_SIZE = 500;

/**
 * Finds a free position for a new block using Spatial Hashing (Binning).
 * Optimization: Instead of checking every block (O(N)), we checks only blocks in nearby bins.
 * This changes the complexity from O(Grid * N) to O(Grid * Density), providing
 * significant speedups when N is large.
 */
export function findFreePosition(
  prevBlocks: ExerciseBlockState[],
  newBlockWidth: number,
  newBlockHeight: number
): Point {
  const COLS = Math.ceil(CANVAS_SIZE / BIN_SIZE);
  const ROWS = Math.ceil(CANVAS_SIZE / BIN_SIZE);

  // Initialize spatial bins
  const bins: ExerciseBlockState[][][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => [])
  );

  // Fill bins with existing blocks
  for (const b of prevBlocks) {
    // Determine which bins this block touches (considering PADDING influence)
    // We expand the block's "presence" by PADDING so that when we query a bin,
    // we find any block that could overlap a candidate in that bin.
    const minX = Math.floor((b.x - PADDING) / BIN_SIZE);
    const maxX = Math.floor((b.x + b.width + PADDING) / BIN_SIZE);
    const minY = Math.floor((b.y - PADDING) / BIN_SIZE);
    const maxY = Math.floor((b.y + b.height + PADDING) / BIN_SIZE);

    for (let by = Math.max(0, minY); by <= Math.min(ROWS - 1, maxY); by++) {
      for (let bx = Math.max(0, minX); bx <= Math.min(COLS - 1, maxX); bx++) {
        bins[by][bx].push(b);
      }
    }
  }

  // Iterate through grid points to find a non-overlapping spot
  for (let y = PADDING; y < CANVAS_SIZE; y += GRID_STEP) {
    // Determine bins the CANDIDATE block would touch
    const cMinY = Math.floor(y / BIN_SIZE);
    const cMaxY = Math.floor((y + newBlockHeight) / BIN_SIZE);

    for (let x = PADDING; x < CANVAS_SIZE; x += GRID_STEP) {
      const cMinX = Math.floor(x / BIN_SIZE);
      const cMaxX = Math.floor((x + newBlockWidth) / BIN_SIZE);

      let hasOverlap = false;

      // Check only relevant bins
      outerCheck:
      for (let by = cMinY; by <= cMaxY; by++) {
        if (by >= ROWS) break;
        for (let bx = cMinX; bx <= cMaxX; bx++) {
          if (bx >= COLS) break;

          const bin = bins[by][bx];
          for (const existingBlock of bin) {
            // Strict overlap check (matches original logic)
            // Note: PADDING is applied to both sides effectively
            if (
              x < existingBlock.x + existingBlock.width + PADDING &&
              x + newBlockWidth + PADDING > existingBlock.x &&
              y < existingBlock.y + existingBlock.height + PADDING &&
              y + newBlockHeight + PADDING > existingBlock.y
            ) {
              hasOverlap = true;
              break outerCheck;
            }
          }
        }
      }

      if (!hasOverlap) {
        return { x, y };
      }
    }
  }

  // Fallback to top-left if no space found (matches original behavior)
  return { x: PADDING, y: PADDING };
}
