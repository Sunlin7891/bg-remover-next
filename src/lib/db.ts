// D1 Database helper
export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: number;
  user_id: string;
  original_image_url: string | null;
  processed_image_url: string | null;
  file_size: number | null;
  processing_time_ms: number | null;
  created_at: string;
}

export interface Quota {
  user_id: string;
  daily_limit: number;
  daily_used: number;
  last_reset: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Database {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(db: any) {
    this.db = db;
  }

  // 用户相关
  async getUserById(id: string) {
    const result = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    return result as User | null;
  }

  async getUserByEmail(email: string) {
    const result = await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    return result as User | null;
  }

  async createUser(user: { id: string; email: string; name: string; picture: string; google_id: string }) {
    await this.db.prepare(`
      INSERT INTO users (id, email, name, picture, google_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(user.id, user.email, user.name, user.picture, user.google_id).run();

    // 初始化配额
    await this.db.prepare(`
      INSERT INTO quotas (user_id, daily_limit, daily_used)
      VALUES (?, 10, 0)
    `).bind(user.id).run();

    return this.getUserById(user.id);
  }

  // 使用记录相关
  async addUsageLog(log: { user_id: string; original_image_url?: string; processed_image_url?: string; file_size?: number; processing_time_ms?: number }) {
    await this.db.prepare(`
      INSERT INTO usage_logs (user_id, original_image_url, processed_image_url, file_size, processing_time_ms)
      VALUES (?, ?, ?, ?, ?)
    `).bind(log.user_id, log.original_image_url || null, log.processed_image_url || null, log.file_size || null, log.processing_time_ms || null).run();

    // 更新配额
    await this.db.prepare(`
      UPDATE quotas SET daily_used = daily_used + 1, last_reset = CURRENT_DATE
      WHERE user_id = ?
    `).bind(log.user_id).run();
  }

  async getUserUsageLogs(userId: string, limit: number = 30) {
    const result = await this.db.prepare(`
      SELECT * FROM usage_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(userId, limit).all();
    return result.results as UsageLog[];
  }

  // 配额相关
  async getUserQuota(userId: string) {
    const result = await this.db.prepare(`
      SELECT * FROM quotas
      WHERE user_id = ?
    `).bind(userId).first();

    // 检查是否需要重置（新的一天）
    if (result && result.last_reset !== new Date().toISOString().split('T')[0]) {
      await this.db.prepare(`
        UPDATE quotas SET daily_used = 0, last_reset = CURRENT_DATE
        WHERE user_id = ?
      `).bind(userId).run();
      result.daily_used = 0;
      result.last_reset = new Date().toISOString().split('T')[0];
    }

    return result as Quota | null;
  }
}
