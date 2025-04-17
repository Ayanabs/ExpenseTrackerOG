import { SpendingLimitPeriod } from "../homepage/realmHelpers";

export class Expense extends Realm.Object<Expense> {
  _id!: Realm.BSON.ObjectId;
  amount!: number;
  source!: string;
  date!: Date;
  category?: string;
  period?: SpendingLimitPeriod;

  static schema: Realm.ObjectSchema = {
    name: 'Expense',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      amount: 'double',
      source: 'string',
      date: { type: 'date', indexed: true },
      category: 'string?',
      period: 'SpendingLimitPeriod?', // ✅ ensure this schema is defined and imported
    },
  };
}
