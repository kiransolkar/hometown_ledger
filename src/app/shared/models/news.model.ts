export interface News {
  newsId: number;
  title: string;
  description: string;
  date: Date;
  createdBy: string;  // email of creator
  createdAt: Date;
  isActive: boolean;
}
