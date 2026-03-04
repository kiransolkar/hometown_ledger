import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NewsService } from '../../../core/services/news.service';
import { News } from '../../../shared/models/news.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-news-list',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css'
})
export class NewsListComponent implements OnInit {
  displayedColumns: string[] = ['newsId', 'title', 'date', 'isActive', 'actions'];
  dataSource!: MatTableDataSource<News>;
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private newsService: NewsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.newsService.getAllNews().subscribe(news => {
      this.dataSource = new MatTableDataSource(news);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Custom filter predicate
      this.dataSource.filterPredicate = (data: News, filter: string) => {
        const searchStr = filter.toLowerCase();
        return data.title.toLowerCase().includes(searchStr) ||
               data.description.toLowerCase().includes(searchStr);
      };
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.dataSource.filter = '';
  }

  viewNews(news: News): void {
    this.router.navigate(['/news', news.newsId]);
  }

  addNewNews(): void {
    this.router.navigate(['/news', 'new']);
  }

  async deleteNews(news: News): Promise<void> {
    if (confirm(`Are you sure you want to delete "${news.title}"?`)) {
      try {
        await this.newsService.deleteNews(news.newsId);
        this.loadNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        alert('Failed to delete news. Please try again.');
      }
    }
  }
}
