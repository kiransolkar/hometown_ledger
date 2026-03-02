export interface Transaction {
  transactionId: number;
  memberId: number;
  year: number;
  annualFee: number;
  meetingFine: number;
  miscFine: number;
  amountPaid: number;
  totalAmount: number;     // Calculated: annualFee + meetingFine + miscFine
  pendingAmount: number;   // Calculated: totalAmount - amountPaid
  meetingsAttended?: number; // For Meeting Fine calculation
  date: Date;
  notes?: string;
}

export function calculateMeetingFine(meetingsAttended: number): number {
  if (meetingsAttended < 0 || meetingsAttended > 4) {
    throw new Error('Meetings attended must be between 0 and 4');
  }
  return 300 * (4 - meetingsAttended);
}

export function calculateTotalAmount(annualFee: number, meetingFine: number, miscFine: number): number {
  return annualFee + meetingFine + miscFine;
}

export function calculatePendingAmount(totalAmount: number, amountPaid: number): number {
  return totalAmount - amountPaid;
}
