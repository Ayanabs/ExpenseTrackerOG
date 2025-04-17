import { Expense } from './database/expenses';
import { SpendingLimitPeriodSchema } from './homepage/realmHelpers';
import Realm from 'realm';
import { realmConfig as importedRealmConfig } from './realmConfig';


export const realmConfig: Realm.Configuration = {
  schema: [Expense, SpendingLimitPeriodSchema], // Include your schemas here
  schemaVersion: 3, // Update schema version when evolving the schema
  onMigration: (oldRealm, newRealm) => {
    
    const oldObjects = oldRealm.objects('SpendingLimitPeriod');
    const newObjects = newRealm.objects('SpendingLimitPeriod');

    // Loop through old objects and update the fields to the new type
    for (let i = 0; i < oldObjects.length; i++) {
      const oldPeriod = oldObjects[i];
      const newPeriod = newObjects[i];


      console.log("Migrating SpendingLimitPeriod...");
      console.log("Old startDate:", oldPeriod.startDate);
      
      // Check if old fields are strings and convert them to Date
      if (typeof oldPeriod.startDate === 'string') {
        newPeriod.startDate = new Date(oldPeriod.startDate); // Convert string to Date
      }
      if (typeof oldPeriod.endDate === 'string') {
        newPeriod.endDate = new Date(oldPeriod.endDate); // Convert string to Date
      }
    }
  },
};
