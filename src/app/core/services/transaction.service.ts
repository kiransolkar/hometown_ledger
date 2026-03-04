import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  Timestamp,
  query,
  where
} from '@angular/fire/firestore';
import { Transaction, calculateMeetingFine, calculateTotalAmount, calculatePendingAmount } from '../../shared/models/transaction.model';
import { MemberService } from './member.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private firestore: Firestore = inject(Firestore);
  private transactionsCollection = collection(this.firestore, 'transactions');
  private migrationKey = 'transactions_migrated';

  constructor(private memberService: MemberService) {
    this.checkAndMigrate();
  }

  private async checkAndMigrate(): Promise<void> {
    const migrated = localStorage.getItem(this.migrationKey);
    if (!migrated) {
      await this.migrateInitialData();
      localStorage.setItem(this.migrationKey, 'true');
    }
  }

  private async migrateInitialData(): Promise<void> {
    const mockData = this.generateMockTransactions();

    try {
      const querySnapshot = await getDocs(this.transactionsCollection);

      // Only migrate if collection is empty
      if (querySnapshot.empty) {
        console.log('Migrating initial transaction data to Firestore...');

        for (const transaction of mockData) {
          const firestoreTransaction = {
            ...transaction,
            date: Timestamp.fromDate(transaction.date)
          };
          await addDoc(this.transactionsCollection, firestoreTransaction);
        }

        console.log('Transaction migration complete!');
      }
    } catch (error) {
      console.error('Error during transaction migration:', error);
    }
  }

  getTransactions(): Observable<Transaction[]> {
    return new Observable<Transaction[]>(subscriber => {
      getDocs(this.transactionsCollection)
        .then(snapshot => {
          const transactions: Transaction[] = snapshot.docs
            .map(doc => {
              const data = doc.data() as any;
              return {
                transactionId: data.transactionId,
                memberId: data.memberId,
                year: data.year,
                annualFee: data.annualFee,
                meetingFine: data.meetingFine,
                miscFine: data.miscFine,
                amountPaid: data.amountPaid,
                totalAmount: data.totalAmount,
                pendingAmount: data.pendingAmount,
                meetingsAttended: data.meetingsAttended,
                date: data.date?.toDate ? data.date.toDate() : data.date,
                notes: data.notes
              };
            })
            .filter(transaction => transaction.transactionId && transaction.memberId && transaction.year);
          subscriber.next(transactions);
          subscriber.complete();
        })
        .catch(error => {
          console.error('Error fetching transactions:', error);
          subscriber.next([]);
          subscriber.complete();
        });
    });
  }

  getTransactionById(id: number): Observable<Transaction | undefined> {
    return this.getTransactions().pipe(
      map(transactions => transactions.find(t => t.transactionId === id))
    );
  }

  getTransactionsByMemberId(memberId: number): Observable<Transaction[]> {
    return this.getTransactions().pipe(
      map(transactions => transactions.filter(t => t.memberId === memberId))
    );
  }

  filterTransactions(
    year?: number,
    memberId?: number
  ): Observable<Transaction[]> {
    return this.getTransactions().pipe(
      map(transactions => {
        let filtered = transactions;

        if (year) {
          filtered = filtered.filter(t => t.year === year);
        }

        if (memberId) {
          filtered = filtered.filter(t => t.memberId === memberId);
        }

        return filtered;
      })
    );
  }

  async addTransaction(transactionData: Omit<Transaction, 'transactionId' | 'totalAmount' | 'pendingAmount'>): Promise<void> {
    try {
      // Get the highest transactionId to generate next ID
      const transactions = await getDocs(this.transactionsCollection);
      let maxId = 0;
      transactions.forEach(doc => {
        const data = doc.data();
        if (data['transactionId'] > maxId) {
          maxId = data['transactionId'];
        }
      });

      // Auto-calculate Meeting Fine if meetingsAttended is provided
      let meetingFine = transactionData.meetingFine;
      if (transactionData.meetingsAttended !== undefined) {
        meetingFine = calculateMeetingFine(transactionData.meetingsAttended);
      }

      // Calculate totalAmount and pendingAmount
      const totalAmount = calculateTotalAmount(transactionData.annualFee, meetingFine, transactionData.miscFine);
      const pendingAmount = calculatePendingAmount(totalAmount, transactionData.amountPaid);

      const newTransaction = {
        ...transactionData,
        transactionId: maxId + 1,
        meetingFine,
        totalAmount,
        pendingAmount,
        date: Timestamp.fromDate(transactionData.date)
      };

      await addDoc(this.transactionsCollection, newTransaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id: number, transactionData: Omit<Transaction, 'transactionId' | 'totalAmount' | 'pendingAmount'>): Promise<void> {
    try {
      // Find document with matching transactionId
      const q = query(this.transactionsCollection, where('transactionId', '==', id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docToUpdate = querySnapshot.docs[0];

        // Auto-calculate Meeting Fine if meetingsAttended is provided
        let meetingFine = transactionData.meetingFine;
        if (transactionData.meetingsAttended !== undefined) {
          meetingFine = calculateMeetingFine(transactionData.meetingsAttended);
        }

        // Calculate totalAmount and pendingAmount
        const totalAmount = calculateTotalAmount(transactionData.annualFee, meetingFine, transactionData.miscFine);
        const pendingAmount = calculatePendingAmount(totalAmount, transactionData.amountPaid);

        const updatedData = {
          ...transactionData,
          meetingFine,
          totalAmount,
          pendingAmount,
          date: Timestamp.fromDate(transactionData.date)
        };

        await updateDoc(doc(this.firestore, 'transactions', docToUpdate.id), updatedData);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      // Find document with matching transactionId
      const q = query(this.transactionsCollection, where('transactionId', '==', id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(doc(this.firestore, 'transactions', docToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Helper method to get transactions with member details
  getTransactionsWithMemberDetails(): Observable<any[]> {
    return combineLatest([this.getTransactions(), this.memberService.getMembers()]).pipe(
      map(([transactions, members]) => {
        return transactions.map(transaction => {
          const member = members.find(m => m.memberId === transaction.memberId);
          return {
            ...transaction,
            memberName: member?.fullName || 'Unknown',
            memberCommunity: member?.community || 'Unknown'
          };
        });
      })
    );
  }

  private generateMockTransactions(): Transaction[] {
    return [
      {
        transactionId: 1,
        memberId: 1,
        year: 2023,
        annualFee: 600,
        meetingFine: 300,
        miscFine: 0,
        amountPaid: 900,
        totalAmount: 900,
        pendingAmount: 0,
        meetingsAttended: 3,
        date: new Date(2023, 0, 15),
        notes: 'Fully paid - Missed 1 meeting'
      },
      {
        transactionId: 2,
        memberId: 2,
        year: 2023,
        annualFee: 600,
        meetingFine: 0,
        miscFine: 500,
        amountPaid: 600,
        totalAmount: 1100,
        pendingAmount: 500,
        meetingsAttended: 4,
        date: new Date(2023, 0, 20),
        notes: 'Late payment penalty - Partial payment'
      },
      {
        transactionId: 3,
        memberId: 3,
        year: 2023,
        annualFee: 600,
        meetingFine: 600,
        miscFine: 0,
        amountPaid: 1200,
        totalAmount: 1200,
        pendingAmount: 0,
        meetingsAttended: 2,
        date: new Date(2023, 0, 18),
        notes: 'Fully paid - Missed 2 meetings'
      },
      {
        transactionId: 4,
        memberId: 4,
        year: 2024,
        annualFee: 600,
        meetingFine: 900,
        miscFine: 0,
        amountPaid: 600,
        totalAmount: 600,
        pendingAmount: 0,
        meetingsAttended: 1,
        date: new Date(2024, 0, 10),
        notes: 'Fully paid - Missed 3 meetings'
      },
      {
        transactionId: 5,
        memberId: 5,
        year: 2024,
        annualFee: 600,
        meetingFine: 0,
        miscFine: 0,
        amountPaid: 600,
        totalAmount: 600,
        pendingAmount: 0,
        meetingsAttended: 4,
        date: new Date(2024, 0, 12),
        notes: 'Fully paid - Attended all meetings'
      },
      {
        transactionId: 6,
        memberId: 6,
        year: 2024,
        annualFee: 600,
        meetingFine: 0,
        miscFine: 1000,
        amountPaid: 600,
        totalAmount: 1600,
        pendingAmount: 1000,
        meetingsAttended: 4,
        date: new Date(2024, 0, 15),
        notes: 'Damage to community property - Pending payment'
      },
      {
        transactionId: 7,
        memberId: 7,
        year: 2025,
        annualFee: 600,
        meetingFine: 300,
        miscFine: 0,
        amountPaid: 900,
        totalAmount: 900,
        pendingAmount: 0,
        meetingsAttended: 3,
        date: new Date(2025, 0, 8),
        notes: 'Fully paid - Missed 1 meeting'
      },
      {
        transactionId: 8,
        memberId: 8,
        year: 2025,
        annualFee: 600,
        meetingFine: 600,
        miscFine: 0,
        amountPaid: 1200,
        totalAmount: 1200,
        pendingAmount: 0,
        meetingsAttended: 2,
        date: new Date(2025, 0, 12),
        notes: 'Fully paid - Missed 2 meetings'
      },
      {
        transactionId: 9,
        memberId: 9,
        year: 2025,
        annualFee: 600,
        meetingFine: 0,
        miscFine: 0,
        amountPaid: 600,
        totalAmount: 600,
        pendingAmount: 0,
        meetingsAttended: 4,
        date: new Date(2025, 0, 16),
        notes: 'Fully paid - Attended all meetings'
      },
      {
        transactionId: 10,
        memberId: 10,
        year: 2025,
        annualFee: 600,
        meetingFine: 0,
        miscFine: 750,
        amountPaid: 600,
        totalAmount: 1350,
        pendingAmount: 750,
        meetingsAttended: 4,
        date: new Date(2025, 0, 20),
        notes: 'Noise complaint fine - Pending fine payment'
      },
      {
        transactionId: 11,
        memberId: 11,
        year: 2026,
        annualFee: 600,
        meetingFine: 0,
        miscFine: 0,
        amountPaid: 600,
        totalAmount: 600,
        pendingAmount: 0,
        meetingsAttended: 4,
        date: new Date(2026, 0, 5),
        notes: 'Fully paid - Attended all meetings'
      },
      {
        transactionId: 12,
        memberId: 12,
        year: 2026,
        annualFee: 600,
        meetingFine: 0,
        miscFine: 0,
        amountPaid: 600,
        totalAmount: 600,
        pendingAmount: 0,
        meetingsAttended: 4,
        date: new Date(2026, 0, 8),
        notes: 'Fully paid - Attended all meetings'
      },
      {
        transactionId: 13,
        memberId: 13,
        year: 2026,
        annualFee: 600,
        meetingFine: 300,
        miscFine: 0,
        amountPaid: 900,
        totalAmount: 900,
        pendingAmount: 0,
        meetingsAttended: 3,
        date: new Date(2026, 0, 10),
        notes: 'Fully paid - Missed 1 meeting'
      },
      {
        transactionId: 14,
        memberId: 14,
        year: 2026,
        annualFee: 600,
        meetingFine: 0,
        miscFine: 0,
        amountPaid: 600,
        totalAmount: 600,
        pendingAmount: 0,
        meetingsAttended: 4,
        date: new Date(2026, 0, 12),
        notes: 'Partial payment - Balance pending'
      },
      {
        transactionId: 15,
        memberId: 15,
        year: 2026,
        annualFee: 600,
        meetingFine: 0,
        miscFine: 500,
        amountPaid: 1100,
        totalAmount: 1100,
        pendingAmount: 0,
        meetingsAttended: 4,
        date: new Date(2026, 0, 15),
        notes: 'Fully paid - Parking violation fine included'
      }
    ];
  }
}
