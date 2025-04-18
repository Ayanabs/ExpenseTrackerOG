// category.ts
import { COLORS } from '../../theme';

// Category interface
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
}

// Metadata for icons/colors
export const categoryMeta: Record<string, { icon: string; color: string }> = {
  Groceries: { icon: 'cart', color: COLORS.success },
  Taxi: { icon: 'taxi', color: COLORS.danger },
  Entertainment: { icon: 'gamepad', color: COLORS.warning },
  // Add other categories here
};
