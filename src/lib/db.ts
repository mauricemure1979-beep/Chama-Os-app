// Database for Chama OS - localStorage-based implementation

export interface OfflineStorage {
  init(): Promise<void>;
  storeChange(table: string, operation: 'insert' | 'update' | 'delete', data: Record<string, unknown>): Promise<void>;
  getPendingChanges(): Promise<Array<{ id: string; table: string; operation: string; data: unknown }>>;
  markSynced(ids: string[]): Promise<void>;
  close(): Promise<void>;
}

export class SQLiteStorage implements OfflineStorage {
  private db: any = null;

  async init(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        console.warn('Using localStorage fallback for offline storage');
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

function getStorageKey(table: string) {
  return `chama_${table}`;
}

export const db = {
  getChamas() {
    return JSON.parse(localStorage.getItem(getStorageKey('chamas')) || '[]');
  },

  saveChama(chama: Record<string, unknown>) {
    const chamas = db.getChamas();
    chamas.push({ ...chama, id: chama.id || crypto.randomUUID() });
    localStorage.setItem(getStorageKey('chamas'), JSON.stringify(chamas));
    return chama;
  },

  getUsers() {
    return JSON.parse(localStorage.getItem(getStorageKey('users')) || '[]');
  },

  saveUser(user: Record<string, unknown>) {
    const users = db.getUsers();
    const existing = users.findIndex((u: { phone: string }) => u.phone === user.phone);
    if (existing >= 0) {
      users[existing] = { ...users[existing], ...user };
    } else {
      users.push({ ...user, id: user.id || crypto.randomUUID() });
    }
    localStorage.setItem(getStorageKey('users'), JSON.stringify(users));
    return user;
  },

  getContributions() {
    return JSON.parse(localStorage.getItem(getStorageKey('contributions')) || '[]');
  },

  saveContribution(contribution: Record<string, unknown>) {
    const contributions = db.getContributions();
    contributions.push({ ...contribution, id: contribution.id || crypto.randomUUID(), createdAt: new Date().toISOString() });
    localStorage.setItem(getStorageKey('contributions'), JSON.stringify(contributions));
    return contribution;
  },

  getMembers() {
    return JSON.parse(localStorage.getItem(getStorageKey('members')) || '[]');
  },

  saveMember(member: Record<string, unknown>) {
    const members = db.getMembers();
    members.push({ ...member, id: member.id || crypto.randomUUID() });
    localStorage.setItem(getStorageKey('members'), JSON.stringify(members));
    return member;
  },

  // Chat messages
  getMessages() {
    return JSON.parse(localStorage.getItem('chama_messages') || '[]');
  },

  saveMessage(message: Record<string, unknown>) {
    const messages = db.getMessages();
    messages.push({ ...message, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    localStorage.setItem('chama_messages', JSON.stringify(messages));
    return message;
  },

  // Rules and Constitution
  getRules() {
    return JSON.parse(localStorage.getItem('chama_rules') || '[]');
  },

  saveRule(rule: Record<string, unknown>) {
    const rules = db.getRules();
    rules.push({ ...rule, id: rule.id || crypto.randomUUID(), createdAt: new Date().toISOString() });
    localStorage.setItem('chama_rules', JSON.stringify(rules));
    return rule;
  },

  updateRule(id: string, updates: Record<string, unknown>) {
    const rules = db.getRules();
    const index = rules.findIndex((r: { id: string }) => r.id === id);
    if (index >= 0) {
      rules[index] = { ...rules[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('chama_rules', JSON.stringify(rules));
    }
    return rules[index];
  },

  deleteRule(id: string) {
    const rules = db.getRules().filter((r: { id: string }) => r.id !== id);
    localStorage.setItem('chama_rules', JSON.stringify(rules));
  },

  // Initialize with demo data
  initDemo() {
    if (db.getMembers().length === 0) {
      const demoMembers = [
        { id: '1', name: 'Wanjiku Wanjiru', phone: '+254712345678', totalContributions: 45000, status: 'active', role: 'member' },
        { id: '2', name: 'Kamau Maina', phone: '+254723456789', totalContributions: 32000, status: 'active', role: 'member' },
        { id: '3', name: 'Achieng Ochieng', phone: '+254734567890', totalContributions: 51000, status: 'active', role: 'member' },
        { id: '4', name: 'Omondi Otieno', phone: '+254745678901', totalContributions: 28000, status: 'active', role: 'member' },
        { id: '5', name: 'Njoroge Kimani', phone: '+254756789012', totalContributions: 45000, status: 'active', role: 'treasurer' },
      ];
      localStorage.setItem(getStorageKey('members'), JSON.stringify(demoMembers));

      const demoContributions = [
        { id: '1', memberId: '1', memberName: 'Wanjiku Wanjiru', amount: 2000, date: '2025-04-20', status: 'paid' },
        { id: '2', memberId: '2', memberName: 'Kamau Maina', amount: 2000, date: '2025-04-19', status: 'paid' },
        { id: '3', memberId: '3', memberName: 'Achieng Ochieng', amount: 2000, date: '2025-04-18', status: 'paid' },
        { id: '4', memberId: '4', memberName: 'Omondi Otieno', amount: 1500, date: '2025-04-17', status: 'partial' },
      ];
      localStorage.setItem(getStorageKey('contributions'), JSON.stringify(demoContributions));
    }

    if (db.getRules().length === 0) {
      const demoRules = [
        { id: '1', title: 'Monthly Contribution', content: 'Each member must contribute KES 2,000 by the 5th of every month.', category: 'contribution' },
        { id: '2', title: 'Late Payment Fine', content: 'A 10% penalty will be applied for late payments after the due date.', category: 'fine' },
        { id: '3', title: 'Payout Rotation', content: 'Members receive payouts in rotation order. The treasurer announces the schedule monthly.', category: 'payout' },
        { id: '4', title: 'Minimum Members', content: 'The group must maintain at least 5 active members at all times.', category: 'membership' },
      ];
      localStorage.setItem('chama_rules', JSON.stringify(demoRules));
    }
  }
};