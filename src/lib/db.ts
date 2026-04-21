// Database client for Chama OS
// Uses Supabase (PostgreSQL) with SQLite fallback for offline mode

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase client (online mode)
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { params: { eventsPerSecond: 10 } }
}) as SupabaseClient<any>;

// Offline storage interface
export interface OfflineStorage {
  init(): Promise<void>;
  storeChange(table: string, operation: 'insert' | 'update' | 'delete', data: Record<string, unknown>): Promise<void>;
  getPendingChanges(): Promise<Array<{ id: string; table: string; operation: string; data: unknown }>>;
  markSynced(ids: string[]): Promise<void>;
  close(): Promise<void>;
}

// SQLite storage mock (uses localStorage in browser)
export class SQLiteStorage implements OfflineStorage {
  private db: any = null;

  async init(): Promise<void> {
    try {
      // In browser, check for IndexedDB support
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        // @ts-ignore - Dexie.js or custom wrapper would be used in production
        this.db = await this.initIndexedDB();
      } else {
        console.warn('IndexedDB not available, using localStorage fallback');
      }
    } catch (error) {
      console.error('Failed to init offline storage:', error);
    }
  }

  async storeChange(table: string, operation: string, data: Record<string, unknown>): Promise<void> {
    const changes = JSON.parse(localStorage.getItem('chama_os_pending') || '[]');
    changes.push({ id: crypto.randomUUID(), table, operation, data, timestamp: Date.now() });
    localStorage.setItem('chama_os_pending', JSON.stringify(changes));
  }

  async getPendingChanges(): Promise<Array<{ id: string; table: string; operation: string; data: unknown }>> {
    return JSON.parse(localStorage.getItem('chama_os_pending') || '[]');
  }

  async markSynced(ids: string[]): Promise<void> {
    let changes = JSON.parse(localStorage.getItem('chama_os_pending') || '[]');
    changes = changes.filter((c: { id: string }) => !ids.includes(c.id));
    localStorage.setItem('chama_os_pending', JSON.stringify(changes));
  }

  async close(): Promise<void> {}
}

// Type-safe database queries
export const db = {
  // Chamas
  async getChamas(userId: string) {
    const { data, error } = await supabase
      .from('chamas')
      .select(`
        *,
        chama_members (
          id, user_id, status, total_contributions_cents,
          user: users (id, full_name, phone_number, role)
        )
      `)
      .eq('treasurer_id', userId)
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  async getChamaById(chamaId: string) {
    const { data, error } = await supabase
      .from('chamas')
      .select(`
        *,
        chama_members (
          id, user_id, status, total_contributions_cents, next_payout_date,
          user: users (id, full_name, phone_number, role)
        )
      `)
      .eq('id', chamaId)
      .single();
    if (error) throw error;
    return data;
  },

  // Contributions
  async getContributions(chamaId: string, limit = 50) {
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        *,
        chama_members (
          user: users (full_name)
        )
      `)
      .eq('chama_id', chamaId)
      .order('contribution_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async createContribution(params: {
    chama_id: string;
    member_id: string;
    amount_cents: number;
    contribution_date: string;
    payment_method: string;
  }) {
    const { data, error } = await supabase
      .from('contributions')
      .insert([params])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateContribution(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('contributions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Members
  async getChamaMembers(chamaId: string) {
    const { data, error } = await supabase
      .from('chama_members')
      .select(`
        *,
        user: users (id, full_name, phone_number, role, preferred_language)
      `)
      .eq('chama_id', chamaId)
      .eq('status', 'active')
      .order('payout_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addMemberToChama(chamaId: string, userId: string) {
    const { data, error } = await supabase
      .from('chama_members')
      .insert([{ chama_id: chamaId, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Statements
  async getStatements(chamaId: string, memberId?: string) {
    let query = supabase
      .from('statements')
      .select('*')
      .eq('chama_id', chamaId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};
