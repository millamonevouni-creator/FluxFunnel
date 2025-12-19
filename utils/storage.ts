
// Utility for safe LocalStorage operations and Data Integrity

export const safeGet = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    
    const parsed = JSON.parse(item);
    
    // Integrity Check: Handle Array vs Object mismatches
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
        console.warn(`Data integrity mismatch for ${key}. Expected Array, got Object. Resetting.`);
        return fallback;
    }
    
    return parsed;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return fallback;
  }
};

export const safeSet = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    // Handle QuotaExceededError here usually
  }
};

// Data Migration Helper
// Ensures older saved data gets updated with new fields (like votedUserIds)
export const migrateFeedbacks = (feedbacks: any[]): any[] => {
    if (!Array.isArray(feedbacks)) return [];
    
    return feedbacks.map(f => ({
        ...f,
        // Ensure votedUserIds exists
        votedUserIds: Array.isArray(f.votedUserIds) ? f.votedUserIds : [],
        // Ensure comments exists
        comments: Array.isArray(f.comments) ? f.comments : [],
        // Ensure votes is a number
        votes: typeof f.votes === 'number' ? f.votes : 0,
        // Ensure dates are parsed back to Date objects if they are strings
        createdAt: new Date(f.createdAt)
    }));
};
