import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private firestore: Firestore = inject(Firestore);

  async migrateData(): Promise<void> {
    console.log('Starting data migration...');

    await this.migrateMembersIfNeeded();
    await this.migrateTransactionsIfNeeded();

    console.log('Data migration complete!');
  }

  private async migrateMembersIfNeeded(): Promise<void> {
    const migrated = localStorage.getItem('members_migrated');
    if (migrated) {
      console.log('Members already migrated, skipping...');
      return;
    }

    const membersCollection = collection(this.firestore, 'members');
    const snapshot = await getDocs(membersCollection);

    if (!snapshot.empty) {
      console.log('Members collection already has data, marking as migrated...');
      localStorage.setItem('members_migrated', 'true');
      return;
    }

    console.log('Migrating members to Firestore...');
    const mockMembers = this.generateMockMembers();

    for (const member of mockMembers) {
      await addDoc(membersCollection, {
        ...member,
        dateOfBirth: Timestamp.fromDate(member.dateOfBirth),
        middleName: member.middleName || null,
        surnameGroup: member.surnameGroup || null
      });
    }

    localStorage.setItem('members_migrated', 'true');
    console.log(`Migrated ${mockMembers.length} members successfully!`);
  }

  private async migrateTransactionsIfNeeded(): Promise<void> {
    const migrated = localStorage.getItem('transactions_migrated');
    if (migrated) {
      console.log('Transactions already migrated, skipping...');
      return;
    }

    const transactionsCollection = collection(this.firestore, 'transactions');
    const snapshot = await getDocs(transactionsCollection);

    if (!snapshot.empty) {
      console.log('Transactions collection already has data, marking as migrated...');
      localStorage.setItem('transactions_migrated', 'true');
      return;
    }

    console.log('Migrating transactions to Firestore...');
    const mockTransactions = this.generateMockTransactions();

    for (const transaction of mockTransactions) {
      await addDoc(transactionsCollection, {
        ...transaction,
        date: Timestamp.fromDate(transaction.date)
      });
    }

    localStorage.setItem('transactions_migrated', 'true');
    console.log(`Migrated ${mockTransactions.length} transactions successfully!`);
  }

  private generateMockMembers() {
    return [
      { memberId: 1, firstName: 'Bharat', lastName: 'Solkar', fullName: 'Bharat Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1985, 3, 15), address: '123 MG Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543210', emailAddress: 'bharat.solkar@email.com' },
      { memberId: 2, firstName: 'Kailash', lastName: 'Solkar', fullName: 'Kailash Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1980, 6, 22), address: '45 Park Street, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543211', emailAddress: 'kailash.solkar@email.com' },
      { memberId: 3, firstName: 'Nitin', lastName: 'Thik', fullName: 'Nitin Thik', surnameGroup: 'Thik', dateOfBirth: new Date(1990, 11, 5), address: '78 Beach Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543212', emailAddress: 'nitin.thik@email.com' },
      { memberId: 4, firstName: 'Sandeep', lastName: 'Deule', fullName: 'Sandeep Deule', surnameGroup: 'Deule', dateOfBirth: new Date(1988, 2, 18), address: '12 Lake View, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543213', emailAddress: 'sandeep.deule@email.com' },
      { memberId: 5, firstName: 'Ashok', lastName: 'Ashok', fullName: 'Ashok', surnameGroup: 'Ashok', dateOfBirth: new Date(1975, 8, 10), address: '56 Hill Station Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543214', emailAddress: 'ashok@email.com' },
      { memberId: 6, firstName: 'Mangesh', lastName: 'Matthe', fullName: 'Mangesh Matthe', surnameGroup: 'Matthe', dateOfBirth: new Date(1992, 4, 25), address: '89 Green Valley, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543215', emailAddress: 'mangesh.matthe@email.com' },
      { memberId: 7, firstName: 'Nilesh', lastName: 'Thik', fullName: 'Nilesh Thik', surnameGroup: 'Thik', dateOfBirth: new Date(1987, 7, 14), address: '34 Temple Street, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543216', emailAddress: 'nilesh.thik@email.com' },
      { memberId: 8, firstName: 'Sam', lastName: 'Thik', fullName: 'Sam Thik', surnameGroup: 'Thik', dateOfBirth: new Date(1995, 1, 8), address: '67 Sunset Boulevard, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543217', emailAddress: 'sam.thik@email.com' },
      { memberId: 9, firstName: 'Amol', lastName: 'Solkar', fullName: 'Amol Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1984, 10, 30), address: '23 Market Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543218', emailAddress: 'amol.solkar@email.com' },
      { memberId: 10, firstName: 'Anand', lastName: 'Salpe', fullName: 'Anand Salpe', surnameGroup: 'Salpe', dateOfBirth: new Date(1993, 5, 12), address: '90 River View, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543219', emailAddress: 'anand.salpe@email.com' },
      { memberId: 11, firstName: 'Bhagoj', lastName: 'Solkar', fullName: 'Bhagoj Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1982, 9, 3), address: '45 Station Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543220', emailAddress: 'bhagoj.solkar@email.com' },
      { memberId: 12, firstName: 'Ketan', lastName: 'Solkar', fullName: 'Ketan Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1991, 12, 20), address: '78 Garden Street, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543221', emailAddress: 'ketan.solkar@email.com' },
      { memberId: 13, firstName: 'Mahesh', lastName: 'Salpe', fullName: 'Mahesh Salpe', surnameGroup: 'Salpe', dateOfBirth: new Date(1986, 3, 7), address: '12 Fort Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543222', emailAddress: 'mahesh.salpe@email.com' },
      { memberId: 14, firstName: 'Minakshi', lastName: 'Solkar', fullName: 'Minakshi Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1994, 8, 16), address: '56 Valley Road, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543223', emailAddress: 'minakshi.solkar@email.com' },
      { memberId: 15, firstName: 'Paresh', lastName: 'Solkar', fullName: 'Paresh Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1983, 11, 28), address: '89 Central Avenue, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543224', emailAddress: 'paresh.solkar@email.com' },
      { memberId: 16, firstName: 'Prabhakar', lastName: 'Solkar', fullName: 'Prabhakar Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1978, 4, 12), address: '34 Maple Street, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543225', emailAddress: 'prabhakar.solkar@email.com' },
      { memberId: 17, firstName: 'Prathamesh', lastName: 'Solkar', fullName: 'Prathamesh Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1997, 2, 9), address: '67 Oak Avenue, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543226', emailAddress: 'prathamesh.solkar@email.com' },
      { memberId: 18, firstName: 'Sachin', lastName: 'Solkar', fullName: 'Sachin Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1989, 7, 21), address: '23 Pine Road, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543227', emailAddress: 'sachin.solkar@email.com' },
      { memberId: 19, firstName: 'Vijay', lastName: 'Solkar', fullName: 'Vijay Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1981, 10, 15), address: '45 Birch Lane, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543228', emailAddress: 'vijay.solkar@email.com' },
      { memberId: 20, firstName: 'Dinesh', lastName: 'Thik', fullName: 'Dinesh Thik', surnameGroup: 'Thik', dateOfBirth: new Date(1985, 1, 5), address: '90 Cedar Street, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543229', emailAddress: 'dinesh.thik@email.com' },
      { memberId: 21, firstName: 'Sadguru', lastName: 'Samarth', fullName: 'Sadguru Samarth', surnameGroup: 'Samarth', dateOfBirth: new Date(1970, 6, 18), address: '12 Temple Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543230', emailAddress: 'sadguru.samarth@email.com' },
      { memberId: 22, firstName: 'Yaswant', lastName: 'Yaswant', fullName: 'Yaswant', surnameGroup: 'Yaswant', dateOfBirth: new Date(1976, 9, 24), address: '78 Church Street, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543231', emailAddress: 'yaswant@email.com' },
      { memberId: 23, firstName: 'Santosh', lastName: 'Poskar', fullName: 'Santosh Poskar', surnameGroup: 'Poskar', dateOfBirth: new Date(1988, 3, 11), address: '56 Main Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543232', emailAddress: 'santosh.poskar@email.com' },
      { memberId: 24, firstName: 'Uddesh', lastName: 'Poskar', fullName: 'Uddesh Poskar', surnameGroup: 'Poskar', dateOfBirth: new Date(1998, 11, 8), address: '34 College Road, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543233', emailAddress: 'uddesh.poskar@email.com' },
      { memberId: 25, firstName: 'Ratnakar', lastName: 'Poskar', fullName: 'Ratnakar Poskar', surnameGroup: 'Poskar', dateOfBirth: new Date(1974, 5, 29), address: '67 School Lane, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543234', emailAddress: 'ratnakar.poskar@email.com' },
      { memberId: 26, firstName: 'Abhi', lastName: 'Abhi', fullName: 'Abhi', surnameGroup: 'Abhi', dateOfBirth: new Date(1996, 8, 14), address: '23 Hospital Road, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543235', emailAddress: 'abhi@email.com' },
      { memberId: 27, firstName: 'Nitesh', lastName: 'Mathye', fullName: 'Nitesh Mathye', surnameGroup: 'Mathye', dateOfBirth: new Date(1992, 2, 3), address: '45 Bank Street, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543236', emailAddress: 'nitesh.mathye@email.com' },
      { memberId: 28, firstName: 'Kalpesh', lastName: 'Poskar', fullName: 'Kalpesh Poskar', surnameGroup: 'Poskar', dateOfBirth: new Date(1990, 12, 27), address: '90 Market Square, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543237', emailAddress: 'kalpesh.poskar@email.com' },
      { memberId: 29, firstName: 'Milind', middleName: 'Reshma Vinayak', lastName: 'Thok', fullName: 'Milind Reshma Vinayak Thok', surnameGroup: 'Thok', dateOfBirth: new Date(1986, 7, 19), address: '12 Railway Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543238', emailAddress: 'milind.thok@email.com' },
      { memberId: 30, firstName: 'Samir', lastName: 'Mate', fullName: 'Samir Mate', surnameGroup: 'Mate', dateOfBirth: new Date(1993, 4, 6), address: '78 Bus Stand, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543239', emailAddress: 'samir.mate@email.com' },
      { memberId: 31, firstName: 'Ramesh', lastName: 'Mathe', fullName: 'Ramesh Mathe', surnameGroup: 'Mathe', dateOfBirth: new Date(1979, 1, 23), address: '56 Ring Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543240', emailAddress: 'ramesh.mathe@email.com' },
      { memberId: 32, firstName: 'Tejas', lastName: 'Poskar', fullName: 'Tejas Poskar', surnameGroup: 'Poskar', dateOfBirth: new Date(1999, 10, 17), address: '34 Bridge Road, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543241', emailAddress: 'tejas.poskar@email.com' },
      { memberId: 33, firstName: 'Ganpat', lastName: 'Pangle', fullName: 'Ganpat Pangle', surnameGroup: 'Pangle', dateOfBirth: new Date(1972, 6, 30), address: '67 Water Tank Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543242', emailAddress: 'ganpat.pangle@email.com' },
      { memberId: 34, firstName: 'Santosh', lastName: 'Solkar', fullName: 'Santosh Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1987, 9, 9), address: '23 Gandhi Chowk, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543243', emailAddress: 'santosh.solkar@email.com' },
      { memberId: 35, firstName: 'Pravin', lastName: 'Thik', fullName: 'Pravin Thik', surnameGroup: 'Thik', dateOfBirth: new Date(1984, 3, 25), address: '45 Old Market, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543244', emailAddress: 'pravin.thik@email.com' },
      { memberId: 36, firstName: 'Ankesh', lastName: 'Mathe', fullName: 'Ankesh Mathe', surnameGroup: 'Mathe', dateOfBirth: new Date(2000, 11, 12), address: '90 New Colony, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543245', emailAddress: 'ankesh.mathe@email.com' },
      { memberId: 37, firstName: 'Tanish', lastName: 'Matthe', fullName: 'Tanish Matthe', surnameGroup: 'Matthe', dateOfBirth: new Date(2002, 5, 4), address: '12 Sports Complex, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543246', emailAddress: 'tanish.matthe@email.com' },
      { memberId: 38, firstName: 'Sanjay', lastName: 'Solkar', fullName: 'Sanjay Solkar', surnameGroup: 'Solkar', dateOfBirth: new Date(1980, 8, 20), address: '78 Industrial Area, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543247', emailAddress: 'sanjay.solkar@email.com' },
      { memberId: 39, firstName: 'Prajakta', lastName: 'Poskar', fullName: 'Prajakta Poskar', surnameGroup: 'Poskar', dateOfBirth: new Date(1995, 2, 14), address: '56 Residency Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543248', emailAddress: 'prajakta.poskar@email.com' },
      { memberId: 40, firstName: 'Haresh', lastName: 'Mathye', fullName: 'Haresh Mathye', surnameGroup: 'Mathye', dateOfBirth: new Date(1983, 12, 1), address: '34 Commerce Street, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543249', emailAddress: 'haresh.mathye@email.com' },
      { memberId: 41, firstName: 'Vijay', lastName: 'Poskar', fullName: 'Vijay Poskar', surnameGroup: 'Poskar', dateOfBirth: new Date(1977, 7, 7), address: '67 Victory Square, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543250', emailAddress: 'vijay.poskar@email.com' },
      { memberId: 42, firstName: 'Mangesh', lastName: 'Poskar', fullName: 'Mangesh Poskar', surnameGroup: 'Poskar', dateOfBirth: new Date(1991, 4, 16), address: '23 Heritage Lane, Salpewadi', community: 'Salpewadi', phoneNumber: '+91-9876543251', emailAddress: 'mangesh.poskar@email.com' },
      { memberId: 43, firstName: 'Dinkar', lastName: 'Thik', fullName: 'Dinkar Thik', surnameGroup: 'Thik', dateOfBirth: new Date(1989, 1, 28), address: '45 Unity Road, Mumbai', community: 'Mumbai', phoneNumber: '+91-9876543252', emailAddress: 'dinkar.thik@email.com' }
    ];
  }

  private generateMockTransactions() {
    return [
      { transactionId: 1, memberId: 1, year: 2023, annualFee: 600, meetingFine: 300, miscFine: 0, amountPaid: 900, totalAmount: 900, pendingAmount: 0, meetingsAttended: 3, date: new Date(2023, 0, 15), notes: 'Fully paid - Missed 1 meeting' },
      { transactionId: 2, memberId: 2, year: 2023, annualFee: 600, meetingFine: 0, miscFine: 500, amountPaid: 600, totalAmount: 1100, pendingAmount: 500, meetingsAttended: 4, date: new Date(2023, 0, 20), notes: 'Late payment penalty - Partial payment' },
      { transactionId: 3, memberId: 3, year: 2023, annualFee: 600, meetingFine: 600, miscFine: 0, amountPaid: 1200, totalAmount: 1200, pendingAmount: 0, meetingsAttended: 2, date: new Date(2023, 0, 18), notes: 'Fully paid - Missed 2 meetings' },
      { transactionId: 4, memberId: 4, year: 2024, annualFee: 600, meetingFine: 900, miscFine: 0, amountPaid: 600, totalAmount: 600, pendingAmount: 0, meetingsAttended: 1, date: new Date(2024, 0, 10), notes: 'Fully paid - Missed 3 meetings' },
      { transactionId: 5, memberId: 5, year: 2024, annualFee: 600, meetingFine: 0, miscFine: 0, amountPaid: 600, totalAmount: 600, pendingAmount: 0, meetingsAttended: 4, date: new Date(2024, 0, 12), notes: 'Fully paid - Attended all meetings' },
      { transactionId: 6, memberId: 6, year: 2024, annualFee: 600, meetingFine: 0, miscFine: 1000, amountPaid: 600, totalAmount: 1600, pendingAmount: 1000, meetingsAttended: 4, date: new Date(2024, 0, 15), notes: 'Damage to community property - Pending payment' },
      { transactionId: 7, memberId: 7, year: 2025, annualFee: 600, meetingFine: 300, miscFine: 0, amountPaid: 900, totalAmount: 900, pendingAmount: 0, meetingsAttended: 3, date: new Date(2025, 0, 8), notes: 'Fully paid - Missed 1 meeting' },
      { transactionId: 8, memberId: 8, year: 2025, annualFee: 600, meetingFine: 600, miscFine: 0, amountPaid: 1200, totalAmount: 1200, pendingAmount: 0, meetingsAttended: 2, date: new Date(2025, 0, 12), notes: 'Fully paid - Missed 2 meetings' },
      { transactionId: 9, memberId: 9, year: 2025, annualFee: 600, meetingFine: 0, miscFine: 0, amountPaid: 600, totalAmount: 600, pendingAmount: 0, meetingsAttended: 4, date: new Date(2025, 0, 16), notes: 'Fully paid - Attended all meetings' },
      { transactionId: 10, memberId: 10, year: 2025, annualFee: 600, meetingFine: 0, miscFine: 750, amountPaid: 600, totalAmount: 1350, pendingAmount: 750, meetingsAttended: 4, date: new Date(2025, 0, 20), notes: 'Noise complaint fine - Pending fine payment' },
      { transactionId: 11, memberId: 11, year: 2026, annualFee: 600, meetingFine: 0, miscFine: 0, amountPaid: 600, totalAmount: 600, pendingAmount: 0, meetingsAttended: 4, date: new Date(2026, 0, 5), notes: 'Fully paid - Attended all meetings' },
      { transactionId: 12, memberId: 12, year: 2026, annualFee: 600, meetingFine: 0, miscFine: 0, amountPaid: 600, totalAmount: 600, pendingAmount: 0, meetingsAttended: 4, date: new Date(2026, 0, 8), notes: 'Fully paid - Attended all meetings' },
      { transactionId: 13, memberId: 13, year: 2026, annualFee: 600, meetingFine: 300, miscFine: 0, amountPaid: 900, totalAmount: 900, pendingAmount: 0, meetingsAttended: 3, date: new Date(2026, 0, 10), notes: 'Fully paid - Missed 1 meeting' },
      { transactionId: 14, memberId: 14, year: 2026, annualFee: 600, meetingFine: 0, miscFine: 0, amountPaid: 600, totalAmount: 600, pendingAmount: 0, meetingsAttended: 4, date: new Date(2026, 0, 12), notes: 'Partial payment - Balance pending' },
      { transactionId: 15, memberId: 15, year: 2026, annualFee: 600, meetingFine: 0, miscFine: 500, amountPaid: 1100, totalAmount: 1100, pendingAmount: 0, meetingsAttended: 4, date: new Date(2026, 0, 15), notes: 'Fully paid - Parking violation fine included' }
    ];
  }
}
