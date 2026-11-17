import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { WatchedPair, WatchedPairCreate } from "@/types";

// Acesso ao banco SQLite (data/app.db). Usado apenas pelo backend.
// O banco usa o modo de journal padrão (DELETE); o modo WAL nunca é ativado.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS watched_pairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    base TEXT NOT NULL,
    quote TEXT NOT NULL,
    target_rate REAL NOT NULL CHECK (target_rate > 0),
    note TEXT CHECK (note IS NULL OR length(note) <= 500),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (base, quote)
  );
`;

// Registros iniciais, inseridos apenas quando o arquivo do banco é criado.
const SEED: WatchedPairCreate[] = [
  { base: "USD", quote: "BRL", target_rate: 5.2, note: "Viagem aos Estados Unidos em janeiro." },
  { base: "EUR", quote: "BRL", target_rate: 6.5, note: null },
  { base: "GBP", quote: "BRL", target_rate: 7.0, note: "Pagamento do curso de inglês em Londres." },
  { base: "EUR", quote: "USD", target_rate: 1.1, note: null },
  { base: "USD", quote: "JPY", target_rate: 165, note: "Comprar ienes para a viagem ao Japão." },
  { base: "GBP", quote: "USD", target_rate: 1.4, note: null },
  { base: "CHF", quote: "EUR", target_rate: 1.05, note: "Acompanhar o franco suíço." },
];

function openDatabase(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  // Verifica antes de abrir: abrir o banco cria o arquivo.
  const isNew = !fs.existsSync(DB_PATH);
  const db = new Database(DB_PATH);

  const setup = db.transaction(() => {
    db.exec(SCHEMA);
    if (isNew) {
      const insert = db.prepare(
        "INSERT INTO watched_pairs (base, quote, target_rate, note) VALUES (?, ?, ?, ?)",
      );
      for (const pair of SEED) {
        insert.run(pair.base, pair.quote, pair.target_rate, pair.note);
      }
    }
  });
  setup();

  return db;
}

// Guarda a conexão em globalThis para que o hot reload do Next.js
// não abra uma nova conexão a cada alteração de código.
const globalForDb = globalThis as typeof globalThis & { db?: Database.Database };

function getDb(): Database.Database {
  if (!globalForDb.db) {
    globalForDb.db = openDatabase();
  }
  return globalForDb.db;
}

// Chamada em instrumentation.ts para criar o banco (e o seed) assim que o servidor inicia.
export function initDatabase(): void {
  getDb();
}

export function listWatchedPairs(): WatchedPair[] {
  return getDb()
    .prepare<[], WatchedPair>("SELECT * FROM watched_pairs ORDER BY id")
    .all();
}

export function getWatchedPairById(id: number): WatchedPair | undefined {
  return getDb()
    .prepare<[number], WatchedPair>("SELECT * FROM watched_pairs WHERE id = ?")
    .get(id);
}

export function findWatchedPair(base: string, quote: string): WatchedPair | undefined {
  return getDb()
    .prepare<[string, string], WatchedPair>(
      "SELECT * FROM watched_pairs WHERE base = ? AND quote = ?",
    )
    .get(base, quote);
}

export function insertWatchedPair(
  base: string,
  quote: string,
  targetRate: number,
  note: string | null,
): WatchedPair {
  return getDb()
    .prepare<[string, string, number, string | null], WatchedPair>(
      "INSERT INTO watched_pairs (base, quote, target_rate, note) VALUES (?, ?, ?, ?) RETURNING *",
    )
    .get(base, quote, targetRate, note) as WatchedPair; // RETURNING sempre devolve a linha inserida
}

export function updateWatchedPair(
  id: number,
  targetRate: number,
  note: string | null,
): WatchedPair | undefined {
  return getDb()
    .prepare<[number, string | null, number], WatchedPair>(
      "UPDATE watched_pairs SET target_rate = ?, note = ? WHERE id = ? RETURNING *",
    )
    .get(targetRate, note, id);
}

// Retorna true se algum registro foi removido.
export function deleteWatchedPair(id: number): boolean {
  const result = getDb().prepare<[number]>("DELETE FROM watched_pairs WHERE id = ?").run(id);
  return result.changes > 0;
}
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { WatchedPair, WatchedPairCreate } from "@/types";

// Acesso ao banco SQLite (data/app.db). Usado apenas pelo backend.
// O banco usa o modo de journal padrão (DELETE); o modo WAL nunca é ativado.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS watched_pairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    base TEXT NOT NULL,
    quote TEXT NOT NULL,
    target_rate REAL NOT NULL CHECK (target_rate > 0),
    note TEXT CHECK (note IS NULL OR length(note) <= 500),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (base, quote)
  );
`;

// Registros iniciais, inseridos apenas quando o arquivo do banco é criado.
const SEED: WatchedPairCreate[] = [
  { base: "USD", quote: "BRL", target_rate: 5.2, note: "Viagem aos Estados Unidos em janeiro." },
  { base: "EUR", quote: "BRL", target_rate: 6.5, note: null },
  { base: "GBP", quote: "BRL", target_rate: 7.0, note: "Pagamento do curso de inglês em Londres." },
  { base: "EUR", quote: "USD", target_rate: 1.1, note: null },
  { base: "USD", quote: "JPY", target_rate: 165, note: "Comprar ienes para a viagem ao Japão." },
  { base: "GBP", quote: "USD", target_rate: 1.4, note: null },
  { base: "CHF", quote: "EUR", target_rate: 1.05, note: "Acompanhar o franco suíço." },
];

function openDatabase(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const isNew = !fs.existsSync(DB_PATH);
  const db = new Database(DB_PATH);

  const setup = db.transaction(() => {
    db.exec(SCHEMA);
    if (isNew) {
      const insert = db.prepare(
        "INSERT INTO watched_pairs (base, quote, target_rate, note) VALUES (?, ?, ?, ?)",
      );
      for (const pair of SEED) {
        insert.run(pair.base, pair.quote, pair.target_rate, pair.note);
      }
    }
  });
  setup();

  return db;
}

const globalForDb = globalThis as typeof globalThis & { db?: Database.Database };

function getDb(): Database.Database {
  if (!globalForDb.db) {
    globalForDb.db = openDatabase();
  }
  return globalForDb.db;
}

export function initDatabase(): void {
  getDb();
}

export function listWatchedPairs(): WatchedPair[] {
  return getDb()
    .prepare<[], WatchedPair>("SELECT * FROM watched_pairs ORDER BY id")
    .all();
}

export function getWatchedPairById(id: number): WatchedPair | undefined {
  return getDb()
    .prepare<[number], WatchedPair>("SELECT * FROM watched_pairs WHERE id = ?")
    .get(id);
}

export function findWatchedPair(base: string, quote: string): WatchedPair | undefined {
  return getDb()
    .prepare<[string, string], WatchedPair>(
      "SELECT * FROM watched_pairs WHERE base = ? AND quote = ?",
    )
    .get(base, quote);
}

export function insertWatchedPair(
  base: string,
  quote: string,
  targetRate: number,
  note: string | null,
): WatchedPair {
  return getDb()
    .prepare<[string, string, number, string | null], WatchedPair>(
      "INSERT INTO watched_pairs (base, quote, target_rate, note) VALUES (?, ?, ?, ?) RETURNING *",
    )
    .get(base, quote, targetRate, note) as WatchedPair;
}

export function updateWatchedPair(
  id: number,
  targetRate: number,
  note: string | null,
): WatchedPair | undefined {
  return getDb()
    .prepare<[number, string | null, number], WatchedPair>(
      "UPDATE watched_pairs SET target_rate = ?, note = ? WHERE id = ? RETURNING *",
    )
    .get(targetRate, note, id);
}

export function deleteWatchedPair(id: number): boolean {
  const result = getDb().prepare<[number]>("DELETE FROM watched_pairs WHERE id = ?").run(id);
  return result.changes > 0;
}
