import { BOX_STATUS } from '@/lib/hubbybox-constants';

export type BoxListRow = {
  id: string;
  name: string;
  location?: string | null;
  cover_image_url?: string | null;
  created_at?: string;
  user_id?: string;
  status?: string | null;
  shipping_carrier?: string | null;
  tracking_number?: string | null;
};

export type BoxStatusValue =
  | (typeof BOX_STATUS)[keyof typeof BOX_STATUS]
  | string
  | null
  | undefined;
