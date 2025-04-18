import Realm from 'realm';

// SpendingLimitPeriod Schema
export interface SpendingLimitPeriod {
  _id: string;
  startDate: Date; // Changed to Date
  endDate: Date;   // Changed to Date
  limit: number;
}

// SpendingLimitPeriod Schema definition
export const SpendingLimitPeriodSchema: Realm.ObjectSchema = {
  name: 'SpendingLimitPeriod',
  properties: {
    _id: 'string',
    startDate: 'date', // Changed to Date type
    endDate: 'date',   // Changed to Date type
    limit: 'int',
  },
  primaryKey: '_id',
};

// Helper function to get the current SpendingLimitPeriod
export const getCurrentSpendingLimitPeriod = async (realm: Realm) => {
  try {
    const limitPeriod = realm.objects<SpendingLimitPeriod>('SpendingLimitPeriod').sorted('startDate', true)[0];
    
    if (limitPeriod) {
      console.log(`Current limit period: ${limitPeriod.startDate.toISOString()} to ${limitPeriod.endDate.toISOString()}`);
      return limitPeriod; // Return as Date objects
    }
    return null;
  } catch (error) {
    console.error('Error fetching spending limit period:', error);
    return null;
  }
};

// Helper function to create a SpendingLimitPeriod
export const createSpendingLimitPeriod = async (
  realm: Realm,
  startDate: Date,
  endDate: Date,
  limit: number
) => {
  try {
    realm.write(() => {
      realm.create('SpendingLimitPeriod', {
        _id: `limit-${startDate.toISOString()}-${endDate.toISOString()}`,
        startDate, // Store Date directly
        endDate,   // Store Date directly
        limit,
      });
    });
  } catch (error) {
    console.error('Error creating spending limit period:', error);
  }
};

// Helper function to update a SpendingLimitPeriod
export const updateSpendingLimitPeriod = async (
  realm: Realm,
  startDate: Date,
  endDate: Date,
  limit: number
) => {
  try {
    const existing = realm.objects<SpendingLimitPeriod>('SpendingLimitPeriod').filtered(`startDate == $0`, startDate)[0];
    realm.write(() => {
      if (existing) {
        existing.endDate = endDate;
        existing.limit = limit;
      } else {
        realm.create('SpendingLimitPeriod', {
          _id: `limit-${startDate.toISOString()}-${endDate.toISOString()}`,
          startDate, // Store Date directly
          endDate,   // Store Date directly
          limit,
        });
      }
    });
  } catch (error) {
    console.error('Error updating spending limit period:', error);
  }
};
