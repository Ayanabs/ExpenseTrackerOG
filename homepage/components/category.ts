// category.ts
import { COLORS } from '../../theme';

// Category interface
export interface Category {
  id: string; // Assuming each category has a unique ID
  name: string;
  spent: number; // Amount spent in this category
  limit: number; // The budget limit for this category
  color: string; // Color for category display
  icon: string; // Icon for the category, e.g., 'shopping' or 'food'
  userId: string; // ID of the user to associate category with the user
}

// Metadata for icons/colors
export const categoryMeta: Record<string, { icon: string; color: string }> = {
  Groceries: { icon: 'cart', color: COLORS.success },
  Taxi: { icon: 'taxi', color: COLORS.danger },
  Entertainment: { icon: 'gamepad', color: COLORS.warning },
  // Add other categories here
};
