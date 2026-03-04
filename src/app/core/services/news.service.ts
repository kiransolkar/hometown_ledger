import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot
} from '@angular/fire/firestore';
import { News } from '../../shared/models/news.model';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private firestore: Firestore = inject(Firestore);
  private newsCollection = collection(this.firestore, 'news');
  private migrationKey = 'news_migrated';

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
    const mockData = this.generateMockNews();

    try {
      const querySnapshot = await getDocs(this.newsCollection);

      // Only migrate if collection is empty
      if (querySnapshot.empty) {
        console.log('Migrating initial news data to Firestore...');

        for (const news of mockData) {
          const firestoreNews = {
            newsId: news.newsId,
            title: news.title,
            description: news.description,
            date: Timestamp.fromDate(news.date),
            createdBy: news.createdBy,
            createdAt: Timestamp.fromDate(news.createdAt),
            isActive: news.isActive
          };
          await addDoc(this.newsCollection, firestoreNews);
        }

        console.log('News migration complete!');
      }
    } catch (error) {
      console.error('Error during news migration:', error);
    }
  }

  getNews(): Observable<News[]> {
    return new Observable<News[]>(subscriber => {
      // Use real-time listener for automatic updates
      const unsubscribe = onSnapshot(
        this.newsCollection,
        (snapshot) => {
          const newsList: News[] = snapshot.docs
            .map(doc => {
              const data = doc.data() as any;
              return {
                newsId: data.newsId,
                title: data.title,
                description: data.description,
                date: data.date?.toDate ? data.date.toDate() : data.date,
                createdBy: data.createdBy,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                isActive: data.isActive
              } as News;
            })
            .filter(news => news.newsId && news.title && news.isActive) // Filter active news
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending

          subscriber.next(newsList);
        },
        (error) => {
          console.error('Error fetching news:', error);
          subscriber.next([]);
        }
      );

      // Return cleanup function
      return () => unsubscribe();
    });
  }

  getAllNews(): Observable<News[]> {
    return new Observable<News[]>(subscriber => {
      // Use real-time listener for automatic updates
      const unsubscribe = onSnapshot(
        this.newsCollection,
        (snapshot) => {
          const newsList: News[] = snapshot.docs
            .map(doc => {
              const data = doc.data() as any;
              return {
                newsId: data.newsId,
                title: data.title,
                description: data.description,
                date: data.date?.toDate ? data.date.toDate() : data.date,
                createdBy: data.createdBy,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                isActive: data.isActive
              } as News;
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending

          subscriber.next(newsList);
        },
        (error) => {
          console.error('Error fetching all news:', error);
          subscriber.next([]);
        }
      );

      // Return cleanup function
      return () => unsubscribe();
    });
  }

  getNewsById(id: number): Observable<News | undefined> {
    return this.getAllNews().pipe(
      map(news => news.find(n => n.newsId === id))
    );
  }

  async addNews(newsData: Omit<News, 'newsId' | 'createdAt'>): Promise<void> {
    try {
      // Get the highest newsId to generate next ID
      const snapshot = await getDocs(this.newsCollection);
      let maxId = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data['newsId'] > maxId) {
          maxId = data['newsId'];
        }
      });

      const newNews = {
        newsId: maxId + 1,
        title: newsData.title,
        description: newsData.description,
        date: Timestamp.fromDate(newsData.date),
        createdBy: newsData.createdBy,
        createdAt: Timestamp.now(),
        isActive: newsData.isActive
      };

      await addDoc(this.newsCollection, newNews);
      console.log('News added successfully');
    } catch (error) {
      console.error('Error adding news:', error);
      throw error;
    }
  }

  async updateNews(id: number, newsData: Partial<News>): Promise<void> {
    try {
      // Find document with matching newsId
      const q = query(this.newsCollection, where('newsId', '==', id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docToUpdate = querySnapshot.docs[0];
        const updatedData: any = {};

        if (newsData.title !== undefined) updatedData.title = newsData.title;
        if (newsData.description !== undefined) updatedData.description = newsData.description;
        if (newsData.date !== undefined) updatedData.date = Timestamp.fromDate(newsData.date);
        if (newsData.isActive !== undefined) updatedData.isActive = newsData.isActive;

        await updateDoc(doc(this.firestore, 'news', docToUpdate.id), updatedData);
        console.log('News updated successfully');
      }
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  }

  async deleteNews(id: number): Promise<void> {
    try {
      // Find document with matching newsId
      const q = query(this.newsCollection, where('newsId', '==', id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(doc(this.firestore, 'news', docToDelete.id));
        console.log('News deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }

  private generateMockNews(): News[] {
    const now = new Date();
    return [
      {
        newsId: 1,
        title: 'साळपेवाडी वार्षिक सभा 2026',
        description: 'साळपेवाडी समाज सेवा संघाची वार्षिक सभा २५ मार्च २०२६ रोजी आयोजित केली जाईल. सर्व सदस्यांना उपस्थित राहण्याची विनंती.',
        date: new Date(2026, 2, 25),
        createdBy: 'kiransolkar@gmail.com',
        createdAt: new Date(2026, 2, 1),
        isActive: true
      },
      {
        newsId: 2,
        title: 'Salpewadi Annual Meeting 2026',
        description: 'The annual meeting of Salpewadi Samaj Seva Sangh will be held on March 25, 2026. All members are requested to attend.',
        date: new Date(2026, 2, 25),
        createdBy: 'kiransolkar@gmail.com',
        createdAt: new Date(2026, 2, 1),
        isActive: true
      },
      {
        newsId: 3,
        title: 'नवीन सदस्यांचे स्वागत',
        description: 'आमच्या समुदायात सामील झालेल्या सर्व नवीन सदस्यांचे स्वागत आणि अभिनंदन. एकत्र मिळून आपण आपल्या समाजाची सेवा करू.',
        date: new Date(2026, 2, 10),
        createdBy: 'kiransolkar@gmail.com',
        createdAt: new Date(2026, 2, 5),
        isActive: true
      }
    ];
  }
}
