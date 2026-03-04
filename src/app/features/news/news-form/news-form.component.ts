import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NewsService } from '../../../core/services/news.service';
import { AuthService } from '../../../core/services/auth.service';
import { News } from '../../../shared/models/news.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-news-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.css'
})
export class NewsFormComponent implements OnInit {
  newsForm!: FormGroup;
  isEditMode = false;
  isNewNews = false;
  newsId?: number;
  news?: News;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    const id = this.route.snapshot.paramMap.get('id');

    if (id === 'new') {
      this.isNewNews = true;
      this.isEditMode = true;
    } else if (id) {
      this.newsId = parseInt(id, 10);
      this.loadNews();
    }
  }

  initializeForm(): void {
    this.newsForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      isActive: [true]
    });

    if (!this.isEditMode) {
      this.newsForm.disable();
    }
  }

  loadNews(): void {
    if (this.newsId) {
      this.newsService.getNewsById(this.newsId).subscribe(news => {
        if (news) {
          this.news = news;
          this.newsForm.patchValue({
            title: news.title,
            description: news.description,
            date: news.date,
            isActive: news.isActive
          });
        }
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      this.newsForm.enable();
    } else {
      this.newsForm.disable();
      this.loadNews(); // Reset form to original values
    }
  }

  async onSubmit(): Promise<void> {
    if (this.newsForm.valid) {
      const formValue = this.newsForm.value;
      const currentUser = this.authService.getCurrentUser();

      if (!currentUser?.email) {
        this.snackBar.open('Unable to identify user. Please login again.', 'Close', {
          duration: 3000
        });
        return;
      }

      try {
        if (this.isNewNews) {
          await this.newsService.addNews({
            ...formValue,
            createdBy: currentUser.email
          });
          this.snackBar.open('News added successfully!', 'Close', {
            duration: 3000
          });
        } else if (this.newsId) {
          await this.newsService.updateNews(this.newsId, formValue);
          this.snackBar.open('News updated successfully!', 'Close', {
            duration: 3000
          });
        }

        this.router.navigate(['/news']);
      } catch (error) {
        console.error('Error saving news:', error);
        this.snackBar.open('Error saving news. Please try again.', 'Close', {
          duration: 3000
        });
      }
    }
  }

  onCancel(): void {
    if (this.isEditMode && !this.isNewNews) {
      this.toggleEditMode();
    } else {
      this.router.navigate(['/news']);
    }
  }

  async onDelete(): Promise<void> {
    if (this.newsId && confirm('Are you sure you want to delete this news item?')) {
      try {
        await this.newsService.deleteNews(this.newsId);
        this.snackBar.open('News deleted successfully!', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/news']);
      } catch (error) {
        console.error('Error deleting news:', error);
        this.snackBar.open('Error deleting news. Please try again.', 'Close', {
          duration: 3000
        });
      }
    }
  }
}
