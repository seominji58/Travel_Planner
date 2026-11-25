import { useMemo } from 'react';

const MATRIX_SIZE = 21;
const QUIET_ZONE = 2;

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 0x9e3779b9;
}

function nextPrng(state: number): number {
  let x = state;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}

function isInFinderWithSeparator(row: number, col: number): boolean {
  const topLeft = row <= 7 && col <= 7;
  const topRight = row <= 7 && col >= MATRIX_SIZE - 8;
  const bottomLeft = row >= MATRIX_SIZE - 8 && col <= 7;
  return topLeft || topRight || bottomLeft;
}

function drawFinderPattern(
  matrix: boolean[][],
  startRow: number,
  startCol: number,
): void {
  for (let r = 0; r < 7; r += 1) {
    for (let c = 0; c < 7; c += 1) {
      const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const isInnerCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[startRow + r][startCol + c] = isOuterBorder || isInnerCore;
    }
  }
}

function buildQrMatrix(value: string): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: MATRIX_SIZE }, () =>
    Array.from({ length: MATRIX_SIZE }, () => false),
  );

  // Authentic 7x7 finder patterns at top-left, top-right, and bottom-left
  drawFinderPattern(matrix, 0, 0);
  drawFinderPattern(matrix, 0, MATRIX_SIZE - 7);
  drawFinderPattern(matrix, MATRIX_SIZE - 7, 0);

  // Horizontal & vertical timing patterns (row 6 and col 6)
  for (let i = 8; i <= MATRIX_SIZE - 9; i += 1) {
    const isDark = i % 2 === 0;
    matrix[6][i] = isDark;
    matrix[i][6] = isDark;
  }

  // Standard QR dark module at (4*version + 9, 8) -> (13, 8)
  matrix[13][8] = true;

  // Deterministic pseudo-random data & format modules seeded from `value`
  let prng = hashSeed(value);
  for (let row = 0; row < MATRIX_SIZE; row += 1) {
    for (let col = 0; col < MATRIX_SIZE; col += 1) {
      if (isInFinderWithSeparator(row, col)) {
        continue;
      }
      if (row === 6 || col === 6 || (row === 13 && col === 8)) {
        continue;
      }
      prng = nextPrng(prng);
      // Slight mask pattern XOR for realistic QR module distribution (~50% density)
      const maskBit = (row + col) % 2 === 0 ? 1 : 0;
      matrix[row][col] = ((prng & 1) ^ maskBit) === 1;
    }
  }

  // Deterministic format information strips adjacent to finder separators
  for (let i = 0; i < 6; i += 1) {
    prng = nextPrng(prng);
    const bit = (prng & 1) === 1;
    matrix[8][i] = bit;
    matrix[MATRIX_SIZE - 1 - i][8] = bit;
  }

  return matrix;
}

export function MockQrSvg({
  value,
  size = 192,
}: {
  value: string;
  size?: number;
}) {
  const pathData = useMemo(() => {
    const matrix = buildQrMatrix(value);
    const segments: string[] = [];

    for (let row = 0; row < MATRIX_SIZE; row += 1) {
      for (let col = 0; col < MATRIX_SIZE; col += 1) {
        if (matrix[row][col]) {
          const x = col + QUIET_ZONE;
          const y = row + QUIET_ZONE;
          segments.push(`M${x},${y}h1v1h-1z`);
        }
      }
    }

    return segments.join('');
  }, [value]);

  const totalUnits = MATRIX_SIZE + QUIET_ZONE * 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${totalUnits} ${totalUnits}`}
      role="img"
      aria-label={`디지털 바우처 QR 코드 (${value})`}
      shapeRendering="crispEdges"
      className="block rounded-xl bg-white"
    >
      <rect x={0} y={0} width={totalUnits} height={totalUnits} fill="#FFFFFF" />
      <path d={pathData} fill="#0F172A" />
    </svg>
  );
}
