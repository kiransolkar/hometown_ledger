export interface Member {
  memberId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  surnameGroup?: string;
  dateOfBirth: Date;
  address: string;
  community: 'Mumbai' | 'Salpewadi';
  phoneNumber: string;
  emailAddress: string;
}

export function createFullName(firstName: string, middleName: string | undefined, lastName: string): string {
  const parts = [firstName, middleName, lastName].filter(part => part && part.trim() !== '');
  return parts.join(' ');
}
