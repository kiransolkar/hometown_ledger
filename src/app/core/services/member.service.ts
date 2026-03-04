import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  Timestamp,
  query,
  where,
  DocumentData
} from '@angular/fire/firestore';
import { Member, createFullName } from '../../shared/models/member.model';

interface FirestoreMember extends Omit<Member, 'dateOfBirth'> {
  dateOfBirth: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private firestore: Firestore = inject(Firestore);
  private membersCollection = collection(this.firestore, 'members');
  private migrationKey = 'members_migrated';

  constructor() {
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
    const mockData = this.generateMockMembers();

    try {
      const querySnapshot = await getDocs(this.membersCollection);

      // Only migrate if collection is empty
      if (querySnapshot.empty) {
        console.log('Migrating initial member data to Firestore...');

        for (const member of mockData) {
          const firestoreMember = this.convertToFirestoreMember(member);
          await addDoc(this.membersCollection, firestoreMember);
        }

        console.log('Migration complete!');
      }
    } catch (error) {
      console.error('Error during migration:', error);
    }
  }

  private convertToFirestoreMember(member: Member): any {
    return {
      memberId: member.memberId,
      firstName: member.firstName,
      middleName: member.middleName || null,
      lastName: member.lastName,
      fullName: member.fullName,
      surnameGroup: member.surnameGroup || null,
      dateOfBirth: Timestamp.fromDate(member.dateOfBirth),
      address: member.address,
      community: member.community,
      phoneNumber: member.phoneNumber,
      emailAddress: member.emailAddress
    };
  }

  private convertFromFirestore(doc: any): Member {
    const data = doc.data();
    return {
      ...data,
      dateOfBirth: data.dateOfBirth.toDate(),
      id: doc.id
    } as Member;
  }

  getMembers(): Observable<Member[]> {
    return new Observable<Member[]>(subscriber => {
      getDocs(this.membersCollection)
        .then(snapshot => {
          const members: Member[] = snapshot.docs
            .map(doc => {
              const data = doc.data() as any;
              return {
                memberId: data.memberId,
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                fullName: data.fullName,
                surnameGroup: data.surnameGroup,
                dateOfBirth: data.dateOfBirth?.toDate ? data.dateOfBirth.toDate() : data.dateOfBirth,
                address: data.address,
                community: data.community,
                phoneNumber: data.phoneNumber,
                emailAddress: data.emailAddress
              };
            })
            .filter(member => member.memberId && member.firstName && member.lastName);
          subscriber.next(members);
          subscriber.complete();
        })
        .catch(error => {
          console.error('Error fetching members:', error);
          subscriber.next([]);
          subscriber.complete();
        });
    });
  }

  getMemberById(id: number): Observable<Member | undefined> {
    return this.getMembers().pipe(
      map(members => members.find(m => m.memberId === id))
    );
  }

  searchMembers(searchTerm: string): Observable<Member[]> {
    return this.getMembers().pipe(
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
      return this.getMembers();
    }
    return this.getMembers().pipe(
      map(members => members.filter(m => m.community === community))
    );
  }

  async addMember(memberData: Omit<Member, 'memberId' | 'fullName'>): Promise<void> {
    try {
      // Get the highest memberId to generate next ID
      const members = await getDocs(this.membersCollection);
      let maxId = 0;
      members.forEach(doc => {
        const data = doc.data();
        if (data['memberId'] > maxId) {
          maxId = data['memberId'];
        }
      });

      const newMember = {
        ...memberData,
        memberId: maxId + 1,
        fullName: createFullName(memberData.firstName, memberData.middleName, memberData.lastName),
        dateOfBirth: Timestamp.fromDate(memberData.dateOfBirth),
        middleName: memberData.middleName || null,
        surnameGroup: memberData.surnameGroup || null
      };

      await addDoc(this.membersCollection, newMember);
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  async updateMember(id: number, memberData: Omit<Member, 'memberId' | 'fullName'>): Promise<void> {
    try {
      // Find document with matching memberId
      const q = query(this.membersCollection, where('memberId', '==', id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docToUpdate = querySnapshot.docs[0];
        const updatedData = {
          ...memberData,
          fullName: createFullName(memberData.firstName, memberData.middleName, memberData.lastName),
          dateOfBirth: Timestamp.fromDate(memberData.dateOfBirth),
          middleName: memberData.middleName || null,
          surnameGroup: memberData.surnameGroup || null
        };

        await updateDoc(doc(this.firestore, 'members', docToUpdate.id), updatedData);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  async deleteMember(id: number): Promise<void> {
    try {
      // Find document with matching memberId
      const q = query(this.membersCollection, where('memberId', '==', id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(doc(this.firestore, 'members', docToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  }

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
}
