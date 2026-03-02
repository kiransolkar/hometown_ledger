import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Member, createFullName } from '../../shared/models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private membersSubject = new BehaviorSubject<Member[]>(this.generateMockMembers());
  public members$ = this.membersSubject.asObservable();

  private nextId = 44;

  constructor() {}

  private generateMockMembers(): Member[] {
    return [
      {
        memberId: 1,
        firstName: 'Bharat',
        lastName: 'Solkar',
        fullName: 'Bharat Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1985, 3, 15),
        address: '123 MG Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543210',
        emailAddress: 'bharat.solkar@email.com'
      },
      {
        memberId: 2,
        firstName: 'Kailash',
        lastName: 'Solkar',
        fullName: 'Kailash Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1980, 6, 22),
        address: '45 Park Street, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543211',
        emailAddress: 'kailash.solkar@email.com'
      },
      {
        memberId: 3,
        firstName: 'Nitin',
        lastName: 'Thik',
        fullName: 'Nitin Thik',
        surnameGroup: 'Thik',
        dateOfBirth: new Date(1990, 11, 5),
        address: '78 Beach Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543212',
        emailAddress: 'nitin.thik@email.com'
      },
      {
        memberId: 4,
        firstName: 'Sandeep',
        lastName: 'Deule',
        fullName: 'Sandeep Deule',
        surnameGroup: 'Deule',
        dateOfBirth: new Date(1988, 2, 18),
        address: '12 Lake View, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543213',
        emailAddress: 'sandeep.deule@email.com'
      },
      {
        memberId: 5,
        firstName: 'Ashok',
        lastName: 'Ashok',
        fullName: 'Ashok',
        surnameGroup: 'Ashok',
        dateOfBirth: new Date(1975, 8, 10),
        address: '56 Hill Station Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543214',
        emailAddress: 'ashok@email.com'
      },
      {
        memberId: 6,
        firstName: 'Mangesh',
        lastName: 'Matthe',
        fullName: 'Mangesh Matthe',
        surnameGroup: 'Matthe',
        dateOfBirth: new Date(1992, 4, 25),
        address: '89 Green Valley, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543215',
        emailAddress: 'mangesh.matthe@email.com'
      },
      {
        memberId: 7,
        firstName: 'Nilesh',
        lastName: 'Thik',
        fullName: 'Nilesh Thik',
        surnameGroup: 'Thik',
        dateOfBirth: new Date(1987, 7, 14),
        address: '34 Temple Street, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543216',
        emailAddress: 'nilesh.thik@email.com'
      },
      {
        memberId: 8,
        firstName: 'Sam',
        lastName: 'Thik',
        fullName: 'Sam Thik',
        surnameGroup: 'Thik',
        dateOfBirth: new Date(1995, 1, 8),
        address: '67 Sunset Boulevard, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543217',
        emailAddress: 'sam.thik@email.com'
      },
      {
        memberId: 9,
        firstName: 'Amol',
        lastName: 'Solkar',
        fullName: 'Amol Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1984, 10, 30),
        address: '23 Market Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543218',
        emailAddress: 'amol.solkar@email.com'
      },
      {
        memberId: 10,
        firstName: 'Anand',
        lastName: 'Salpe',
        fullName: 'Anand Salpe',
        surnameGroup: 'Salpe',
        dateOfBirth: new Date(1993, 5, 12),
        address: '90 River View, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543219',
        emailAddress: 'anand.salpe@email.com'
      },
      {
        memberId: 11,
        firstName: 'Bhagoj',
        lastName: 'Solkar',
        fullName: 'Bhagoj Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1982, 9, 3),
        address: '45 Station Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543220',
        emailAddress: 'bhagoj.solkar@email.com'
      },
      {
        memberId: 12,
        firstName: 'Ketan',
        lastName: 'Solkar',
        fullName: 'Ketan Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1991, 12, 20),
        address: '78 Garden Street, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543221',
        emailAddress: 'ketan.solkar@email.com'
      },
      {
        memberId: 13,
        firstName: 'Mahesh',
        lastName: 'Salpe',
        fullName: 'Mahesh Salpe',
        surnameGroup: 'Salpe',
        dateOfBirth: new Date(1986, 3, 7),
        address: '12 Fort Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543222',
        emailAddress: 'mahesh.salpe@email.com'
      },
      {
        memberId: 14,
        firstName: 'Minakshi',
        lastName: 'Solkar',
        fullName: 'Minakshi Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1994, 8, 16),
        address: '56 Valley Road, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543223',
        emailAddress: 'minakshi.solkar@email.com'
      },
      {
        memberId: 15,
        firstName: 'Paresh',
        lastName: 'Solkar',
        fullName: 'Paresh Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1983, 11, 28),
        address: '89 Central Avenue, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543224',
        emailAddress: 'paresh.solkar@email.com'
      },
      {
        memberId: 16,
        firstName: 'Prabhakar',
        lastName: 'Solkar',
        fullName: 'Prabhakar Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1978, 4, 12),
        address: '34 Maple Street, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543225',
        emailAddress: 'prabhakar.solkar@email.com'
      },
      {
        memberId: 17,
        firstName: 'Prathamesh',
        lastName: 'Solkar',
        fullName: 'Prathamesh Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1997, 2, 9),
        address: '67 Oak Avenue, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543226',
        emailAddress: 'prathamesh.solkar@email.com'
      },
      {
        memberId: 18,
        firstName: 'Sachin',
        lastName: 'Solkar',
        fullName: 'Sachin Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1989, 7, 21),
        address: '23 Pine Road, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543227',
        emailAddress: 'sachin.solkar@email.com'
      },
      {
        memberId: 19,
        firstName: 'Vijay',
        lastName: 'Solkar',
        fullName: 'Vijay Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1981, 10, 15),
        address: '45 Birch Lane, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543228',
        emailAddress: 'vijay.solkar@email.com'
      },
      {
        memberId: 20,
        firstName: 'Dinesh',
        lastName: 'Thik',
        fullName: 'Dinesh Thik',
        surnameGroup: 'Thik',
        dateOfBirth: new Date(1985, 1, 5),
        address: '90 Cedar Street, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543229',
        emailAddress: 'dinesh.thik@email.com'
      },
      {
        memberId: 21,
        firstName: 'Sadguru',
        lastName: 'Samarth',
        fullName: 'Sadguru Samarth',
        surnameGroup: 'Samarth',
        dateOfBirth: new Date(1970, 6, 18),
        address: '12 Temple Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543230',
        emailAddress: 'sadguru.samarth@email.com'
      },
      {
        memberId: 22,
        firstName: 'Yaswant',
        lastName: 'Yaswant',
        fullName: 'Yaswant',
        surnameGroup: 'Yaswant',
        dateOfBirth: new Date(1976, 9, 24),
        address: '78 Church Street, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543231',
        emailAddress: 'yaswant@email.com'
      },
      {
        memberId: 23,
        firstName: 'Santosh',
        lastName: 'Poskar',
        fullName: 'Santosh Poskar',
        surnameGroup: 'Poskar',
        dateOfBirth: new Date(1988, 3, 11),
        address: '56 Main Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543232',
        emailAddress: 'santosh.poskar@email.com'
      },
      {
        memberId: 24,
        firstName: 'Uddesh',
        lastName: 'Poskar',
        fullName: 'Uddesh Poskar',
        surnameGroup: 'Poskar',
        dateOfBirth: new Date(1998, 11, 8),
        address: '34 College Road, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543233',
        emailAddress: 'uddesh.poskar@email.com'
      },
      {
        memberId: 25,
        firstName: 'Ratnakar',
        lastName: 'Poskar',
        fullName: 'Ratnakar Poskar',
        surnameGroup: 'Poskar',
        dateOfBirth: new Date(1974, 5, 29),
        address: '67 School Lane, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543234',
        emailAddress: 'ratnakar.poskar@email.com'
      },
      {
        memberId: 26,
        firstName: 'Abhi',
        lastName: 'Abhi',
        fullName: 'Abhi',
        surnameGroup: 'Abhi',
        dateOfBirth: new Date(1996, 8, 14),
        address: '23 Hospital Road, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543235',
        emailAddress: 'abhi@email.com'
      },
      {
        memberId: 27,
        firstName: 'Nitesh',
        lastName: 'Mathye',
        fullName: 'Nitesh Mathye',
        surnameGroup: 'Mathye',
        dateOfBirth: new Date(1992, 2, 3),
        address: '45 Bank Street, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543236',
        emailAddress: 'nitesh.mathye@email.com'
      },
      {
        memberId: 28,
        firstName: 'Kalpesh',
        lastName: 'Poskar',
        fullName: 'Kalpesh Poskar',
        surnameGroup: 'Poskar',
        dateOfBirth: new Date(1990, 12, 27),
        address: '90 Market Square, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543237',
        emailAddress: 'kalpesh.poskar@email.com'
      },
      {
        memberId: 29,
        firstName: 'Milind',
        middleName: 'Reshma Vinayak',
        lastName: 'Thok',
        fullName: 'Milind Reshma Vinayak Thok',
        surnameGroup: 'Thok',
        dateOfBirth: new Date(1986, 7, 19),
        address: '12 Railway Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543238',
        emailAddress: 'milind.thok@email.com'
      },
      {
        memberId: 30,
        firstName: 'Samir',
        lastName: 'Mate',
        fullName: 'Samir Mate',
        surnameGroup: 'Mate',
        dateOfBirth: new Date(1993, 4, 6),
        address: '78 Bus Stand, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543239',
        emailAddress: 'samir.mate@email.com'
      },
      {
        memberId: 31,
        firstName: 'Ramesh',
        lastName: 'Mathe',
        fullName: 'Ramesh Mathe',
        surnameGroup: 'Mathe',
        dateOfBirth: new Date(1979, 1, 23),
        address: '56 Ring Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543240',
        emailAddress: 'ramesh.mathe@email.com'
      },
      {
        memberId: 32,
        firstName: 'Tejas',
        lastName: 'Poskar',
        fullName: 'Tejas Poskar',
        surnameGroup: 'Poskar',
        dateOfBirth: new Date(1999, 10, 17),
        address: '34 Bridge Road, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543241',
        emailAddress: 'tejas.poskar@email.com'
      },
      {
        memberId: 33,
        firstName: 'Ganpat',
        lastName: 'Pangle',
        fullName: 'Ganpat Pangle',
        surnameGroup: 'Pangle',
        dateOfBirth: new Date(1972, 6, 30),
        address: '67 Water Tank Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543242',
        emailAddress: 'ganpat.pangle@email.com'
      },
      {
        memberId: 34,
        firstName: 'Santosh',
        lastName: 'Solkar',
        fullName: 'Santosh Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1987, 9, 9),
        address: '23 Gandhi Chowk, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543243',
        emailAddress: 'santosh.solkar@email.com'
      },
      {
        memberId: 35,
        firstName: 'Pravin',
        lastName: 'Thik',
        fullName: 'Pravin Thik',
        surnameGroup: 'Thik',
        dateOfBirth: new Date(1984, 3, 25),
        address: '45 Old Market, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543244',
        emailAddress: 'pravin.thik@email.com'
      },
      {
        memberId: 36,
        firstName: 'Ankesh',
        lastName: 'Mathe',
        fullName: 'Ankesh Mathe',
        surnameGroup: 'Mathe',
        dateOfBirth: new Date(2000, 11, 12),
        address: '90 New Colony, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543245',
        emailAddress: 'ankesh.mathe@email.com'
      },
      {
        memberId: 37,
        firstName: 'Tanish',
        lastName: 'Matthe',
        fullName: 'Tanish Matthe',
        surnameGroup: 'Matthe',
        dateOfBirth: new Date(2002, 5, 4),
        address: '12 Sports Complex, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543246',
        emailAddress: 'tanish.matthe@email.com'
      },
      {
        memberId: 38,
        firstName: 'Sanjay',
        lastName: 'Solkar',
        fullName: 'Sanjay Solkar',
        surnameGroup: 'Solkar',
        dateOfBirth: new Date(1980, 8, 20),
        address: '78 Industrial Area, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543247',
        emailAddress: 'sanjay.solkar@email.com'
      },
      {
        memberId: 39,
        firstName: 'Prajakta',
        lastName: 'Poskar',
        fullName: 'Prajakta Poskar',
        surnameGroup: 'Poskar',
        dateOfBirth: new Date(1995, 2, 14),
        address: '56 Residency Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543248',
        emailAddress: 'prajakta.poskar@email.com'
      },
      {
        memberId: 40,
        firstName: 'Haresh',
        lastName: 'Mathye',
        fullName: 'Haresh Mathye',
        surnameGroup: 'Mathye',
        dateOfBirth: new Date(1983, 12, 1),
        address: '34 Commerce Street, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543249',
        emailAddress: 'haresh.mathye@email.com'
      },
      {
        memberId: 41,
        firstName: 'Vijay',
        lastName: 'Poskar',
        fullName: 'Vijay Poskar',
        surnameGroup: 'Poskar',
        dateOfBirth: new Date(1977, 7, 7),
        address: '67 Victory Square, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543250',
        emailAddress: 'vijay.poskar@email.com'
      },
      {
        memberId: 42,
        firstName: 'Mangesh',
        lastName: 'Poskar',
        fullName: 'Mangesh Poskar',
        surnameGroup: 'Poskar',
        dateOfBirth: new Date(1991, 4, 16),
        address: '23 Heritage Lane, Salpewadi',
        community: 'Salpewadi',
        phoneNumber: '+91-9876543251',
        emailAddress: 'mangesh.poskar@email.com'
      },
      {
        memberId: 43,
        firstName: 'Dinkar',
        lastName: 'Thik',
        fullName: 'Dinkar Thik',
        surnameGroup: 'Thik',
        dateOfBirth: new Date(1989, 1, 28),
        address: '45 Unity Road, Mumbai',
        community: 'Mumbai',
        phoneNumber: '+91-9876543252',
        emailAddress: 'dinkar.thik@email.com'
      }
    ];
  }

  getMembers(): Observable<Member[]> {
    return this.members$;
  }

  getMemberById(id: number): Observable<Member | undefined> {
    return this.members$.pipe(
      map(members => members.find(m => m.memberId === id))
    );
  }

  searchMembers(searchTerm: string): Observable<Member[]> {
    return this.members$.pipe(
      map(members => members.filter(m =>
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phoneNumber.includes(searchTerm) ||
        m.community.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  filterByCommunit(community: 'Mumbai' | 'Salpewadi' | ''): Observable<Member[]> {
    if (!community) {
      return this.members$;
    }
    return this.members$.pipe(
      map(members => members.filter(m => m.community === community))
    );
  }

  addMember(memberData: Omit<Member, 'memberId' | 'fullName'>): void {
    const newMember: Member = {
      ...memberData,
      memberId: this.nextId++,
      fullName: createFullName(memberData.firstName, memberData.middleName, memberData.lastName)
    };
    const currentMembers = this.membersSubject.value;
    this.membersSubject.next([...currentMembers, newMember]);
  }

  updateMember(id: number, memberData: Omit<Member, 'memberId' | 'fullName'>): void {
    const currentMembers = this.membersSubject.value;
    const index = currentMembers.findIndex(m => m.memberId === id);

    if (index !== -1) {
      const updatedMember: Member = {
        ...memberData,
        memberId: id,
        fullName: createFullName(memberData.firstName, memberData.middleName, memberData.lastName)
      };
      currentMembers[index] = updatedMember;
      this.membersSubject.next([...currentMembers]);
    }
  }

  deleteMember(id: number): void {
    const currentMembers = this.membersSubject.value;
    this.membersSubject.next(currentMembers.filter(m => m.memberId !== id));
  }
}
