import { COLORS } from '../../theme';

export interface Category {
  id: string; 
  name: string;
  spent: number; 
  limit: number; 
  color: string; 
  icon: string; 
  userId: string; 
}


export const categoryMeta: Record<string, { icon: string; color: string }> = {
  Groceries: { icon: 'cart', color: COLORS.success },
  Taxi: { icon: 'taxi', color: COLORS.danger },
  Entertainment: { icon: 'gamepad', color: COLORS.warning },
  
};
