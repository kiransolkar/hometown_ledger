import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { Transaction, calculateMeetingFine, calculateTotalAmount, calculatePendingAmount } from '../../shared/models/transaction.model';
import { MemberService } from './member.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>(this.generateMockTransactions());
  public transactions$ = this.transactionsSubject.asObservable();

  private nextId = 16;

  constructor(private memberService: MemberService) {}

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

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$;
  }

  getTransactionById(id: number): Observable<Transaction | undefined> {
    return this.transactions$.pipe(
      map(transactions => transactions.find(t => t.transactionId === id))
    );
  }

  getTransactionsByMemberId(memberId: number): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(transactions => transactions.filter(t => t.memberId === memberId))
    );
  }

  filterTransactions(
    year?: number,
    memberId?: number
  ): Observable<Transaction[]> {
    return this.transactions$.pipe(
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

  addTransaction(transactionData: Omit<Transaction, 'transactionId' | 'totalAmount' | 'pendingAmount'>): void {
    // Auto-calculate Meeting Fine if meetingsAttended is provided
    let meetingFine = transactionData.meetingFine;
    if (transactionData.meetingsAttended !== undefined) {
      meetingFine = calculateMeetingFine(transactionData.meetingsAttended);
    }

    // Calculate totalAmount and pendingAmount
    const totalAmount = calculateTotalAmount(transactionData.annualFee, meetingFine, transactionData.miscFine);
    const pendingAmount = calculatePendingAmount(totalAmount, transactionData.amountPaid);

    const newTransaction: Transaction = {
      ...transactionData,
      meetingFine,
      totalAmount,
      pendingAmount,
      transactionId: this.nextId++
    };

    const currentTransactions = this.transactionsSubject.value;
    this.transactionsSubject.next([...currentTransactions, newTransaction]);
  }

  updateTransaction(id: number, transactionData: Omit<Transaction, 'transactionId' | 'totalAmount' | 'pendingAmount'>): void {
    const currentTransactions = this.transactionsSubject.value;
    const index = currentTransactions.findIndex(t => t.transactionId === id);

    if (index !== -1) {
      // Auto-calculate Meeting Fine if meetingsAttended is provided
      let meetingFine = transactionData.meetingFine;
      if (transactionData.meetingsAttended !== undefined) {
        meetingFine = calculateMeetingFine(transactionData.meetingsAttended);
      }

      // Calculate totalAmount and pendingAmount
      const totalAmount = calculateTotalAmount(transactionData.annualFee, meetingFine, transactionData.miscFine);
      const pendingAmount = calculatePendingAmount(totalAmount, transactionData.amountPaid);

      const updatedTransaction: Transaction = {
        ...transactionData,
        meetingFine,
        totalAmount,
        pendingAmount,
        transactionId: id
      };

      currentTransactions[index] = updatedTransaction;
      this.transactionsSubject.next([...currentTransactions]);
    }
  }

  deleteTransaction(id: number): void {
    const currentTransactions = this.transactionsSubject.value;
    this.transactionsSubject.next(currentTransactions.filter(t => t.transactionId !== id));
  }

  // Helper method to get transactions with member details
  getTransactionsWithMemberDetails(): Observable<any[]> {
    return combineLatest([this.transactions$, this.memberService.getMembers()]).pipe(
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
}
