// Mock 5×5 rank snapshot data for Phase 4 heatmap development.
// Business center: Arctic Air HVAC Services, Dallas TX (32.7767, -96.7970)
// Grid spacing: ~1 mile (0.0145° lat, 0.0171° lng)
// Replace PLACEHOLDER_BUSINESS_ID with the actual business UUID when seeding.

export const MOCK_KEYWORD = "AC repair Dallas TX";

// Grid coordinates: 5 rows (north→south) × 5 cols (west→east)
// Row 0 = northernmost, Row 4 = southernmost
// Col 0 = westernmost,  Col 4 = easternmost
// Center = Row 2, Col 2

const LATS = [32.8057, 32.7912, 32.7767, 32.7622, 32.7477] as const;
const LNGS = [-96.8312, -96.8141, -96.7970, -96.7799, -96.7628] as const;

// Current snapshot (2026-05-01)
// Layout mirrors the visual grid: rows top→bottom, cols left→right
// null = not ranked in top 100 for that grid point
const CURRENT_RANKS: (number | null)[][] = [
  [null, 21,  14,  17,  null],
  [17,    8,   4,   4,  13  ],
  [15,    4,   1,   2,  11  ],
  [19,    7,   3,   5,  16  ],
  [null, 18,  12,  15,  null],
];

// Previous snapshot (2026-04-24, 7 days prior) — slightly worse, shows improvement trend
const PREVIOUS_RANKS: (number | null)[][] = [
  [null, 24,  17,  20,  null],
  [20,   11,   6,   6,  16  ],
  [18,    7,   3,   4,  14  ],
  [22,   10,   5,   7,  19  ],
  [null, 21,  15,  18,  null],
];

export interface MockSnapshotRow {
  keyword:       string;
  lat:           number;
  lng:           number;
  rank_position: number | null;
  grid_size:     5;
  snapshot_date: string;
}

function buildRows(
  ranks: (number | null)[][],
  date: string
): MockSnapshotRow[] {
  const rows: MockSnapshotRow[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      rows.push({
        keyword:       MOCK_KEYWORD,
        lat:           LATS[r],
        lng:           LNGS[c],
        rank_position: ranks[r][c],
        grid_size:     5,
        snapshot_date: date,
      });
    }
  }
  return rows;
}

export const MOCK_SNAPSHOTS_CURRENT  = buildRows(CURRENT_RANKS,  "2026-05-01");
export const MOCK_SNAPSHOTS_PREVIOUS = buildRows(PREVIOUS_RANKS, "2026-04-24");
export const MOCK_SNAPSHOTS_ALL      = [...MOCK_SNAPSHOTS_CURRENT, ...MOCK_SNAPSHOTS_PREVIOUS];
