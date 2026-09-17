import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * 极简文件存储（演示用）
 * 生产环境请替换为数据库 / 对象存储：这里只是让「按用户存会话」「作品归档」真正跑起来。
 */

const DATA_DIR = path.join(process.cwd(), '.data');

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  const target = path.join(DATA_DIR, file);
  await ensureDir(path.dirname(target));
  await fs.writeFile(target, JSON.stringify(value, null, 2), 'utf8');
}

/* ------------------------------ 会话记忆 ------------------------------ */

export interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  at?: number;
}

export interface StoredSession {
  id: string;
  title: string;
  style?: string;
  summary?: string;
  messages: StoredMessage[];
  updatedAt: number;
}

function safeUser(user: string): string {
  return user.replace(/[^\w.@-]/g, '_').slice(0, 60) || 'guest';
}

export async function readSessions(user: string): Promise<StoredSession[]> {
  return readJson<StoredSession[]>(path.join('memory', `${safeUser(user)}.json`), []);
}

export async function writeSessions(user: string, sessions: StoredSession[]): Promise<void> {
  await writeJson(path.join('memory', `${safeUser(user)}.json`), sessions.slice(0, 30));
}

/* ------------------------------ 作品归档 ------------------------------ */

export interface StoredWork {
  id: string;
  title: string;
  image: string;
  images?: string[];
  author: string;
  source: string;
  projectId?: string | null;
  license?: string;
  prompt?: string;
  negativePrompt?: string;
  model?: string;
  provider?: string;
  createdAt: number;
}

export async function readWorks(): Promise<StoredWork[]> {
  return readJson<StoredWork[]>('works.json', []);
}

export async function addWork(work: StoredWork): Promise<StoredWork[]> {
  const works = await readWorks();
  const next = [work, ...works.filter((item) => item.id !== work.id)].slice(0, 60);
  await writeJson('works.json', next);
  return next;
}

export async function removeWork(id: string): Promise<StoredWork[]> {
  const works = await readWorks();
  const next = works.filter((item) => item.id !== id);
  await writeJson('works.json', next);
  return next;
}
