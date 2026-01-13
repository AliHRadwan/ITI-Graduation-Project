export const TICKET_STATUS = {
  NEW: 'new',
  DOING: 'doing',
  DONE: 'done',
  CANCELED: 'canceled',
};

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const TICKET_CATEGORY = {
  HOUSEKEEPING: 'housekeeping',
  FOOD_AND_DRINKS: 'food_and_drinks',
  MAINTENANCE: 'maintenance',
  ROOM_SERVICE: 'room_service',
  OTHER: 'other',
};

export const CONVERSATION_STATUS = {
  OPEN: 'open',
  HANDOFF: 'handoff',
  CLOSED: 'closed',
};

export const MESSAGE_ROLE = {
  GUEST: 'guest',
  ASSISTANT: 'assistant',
  STAFF: 'staff',
};

export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  CLEANING: 'cleaning',
};

export const POLLING_INTERVALS = {
  FAST: 5000,    // 5 seconds - for active conversations
  MEDIUM: 15000, // 15 seconds - for tickets
  SLOW: 30000,   // 30 seconds - for dashboard metrics
};

