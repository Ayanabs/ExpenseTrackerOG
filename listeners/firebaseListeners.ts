import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const listenToSpendingLimit = (
  onData: (data: {
    maxtotal: number;
    startDate: Date;
    endDate: Date;
    totalDuration: number;
  }) => void,
  onError: (error: any) => void
) => {
  const currentUser = auth().currentUser;
  if (!currentUser) return () => {};

  const spendingLimitDocRef = firestore()
    .collection('spendingLimits')
    .doc(currentUser.uid);

  return spendingLimitDocRef.onSnapshot(
    (doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          const startDate = data.startDate.toDate();
          const endDate = data.endDate.toDate();
          const totalDuration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
          onData({
            maxtotal: data.limit,
            startDate,
            endDate,
            totalDuration
          });
        }
      }
    },
    onError
  );
};

export const listenToExpenses = (
  startDate: Date,
  endDate: Date,
  onUpdate: (totalSpent: number) => void,
  onError: (error: any) => void
) => {
  const currentUser = auth().currentUser;
  if (!currentUser) return () => {};

  const expensesCollectionRef = firestore()
    .collection('expenses')
    .where('userId', '==', currentUser.uid)
    .where('date', '>=', firestore.Timestamp.fromDate(startDate))
    .where('date', '<=', firestore.Timestamp.fromDate(endDate));

  return expensesCollectionRef.onSnapshot(
    (snapshot) => {
      let total = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.amount) {
          total += parseFloat(data.amount.toString());
        }
      });
      onUpdate(total);
    },
    onError
  );
};
