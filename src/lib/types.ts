/**
 * Central type definitions for HubbyBox.
 * Replace all `any` usages across the codebase with these types.
 */

// ─── Database Row Types ──────────────────────────────────────────────

export type UserRow = {
  id: string;
  line_user_id?: string | null;
  box_quota: number;
  created_at?: string;
};

export type BoxRow = {
  id: string;
  name: string;
  user_id?: string;
  location?: string | null;
  cover_image_url?: string | null;
  status?: string | null;
  shipping_carrier?: string | null;
  tracking_number?: string | null;
  allow_staff_open?: boolean;
  access_code?: string | null;
  access_code_expires_at?: string | null;
  created_at?: string;
};

export type ItemRow = {
  id: string;
  box_id: string;
  name: string;
  image_url?: string | null;
  created_at?: string;
};

export type NotificationItem = {
  id: string;
  icon: string;
  color: string;
  bgColor: string;
  title: string;
  desc: string;
  time: string;
  isNew: boolean;
};

export type SupplyOrderRow = {
  id: string;
  product_name: string;
  price: number;
  status: string | null;
  created_at: string;
  user_id: string;
};

export type SupportTicketRow = {
  id: string;
  subject: string;
  created_at: string;
};

// ─── Search Result Types ──────────────────────────────────────────────

export type SearchItemResult = ItemRow & {
  boxes?: { name: string; id: string; user_id: string } | null;
};

export type SearchResults = {
  boxes: BoxRow[];
  items: SearchItemResult[];
};

// ─── Admin Activity Types ─────────────────────────────────────────────

export type RecentBoxActivity = {
  id: string;
  name: string;
  status: string | null;
  created_at: string;
  user_id: string;
};

// ─── Log Types ─────────────────────────────────────────────────────────

export type LogEntry = {
  id: string;
  action: string;
  details?: string | null;
  created_at: string;
  user_id?: string | null;
};
