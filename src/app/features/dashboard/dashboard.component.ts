import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MemberService } from '../../core/services/member.service';
import { TransactionService } from '../../core/services/transaction.service';
import { NewsService } from '../../core/services/news.service';
import { News } from '../../shared/models/news.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalMembers = 0;
  totalTransactions = 0;
  mumbaiMembers = 0;
  salpewadiMembers = 0;
  newsList: News[] = [];

  constructor(
    private memberService: MemberService,
    private transactionService: TransactionService,
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.memberService.getMembers().subscribe(members => {
      this.totalMembers = members.length;
      this.mumbaiMembers = members.filter(m => m.community === 'Mumbai').length;
      this.salpewadiMembers = members.filter(m => m.community === 'Salpewadi').length;
      this.cdr.detectChanges();
    });

    this.transactionService.getTransactions().subscribe(transactions => {
      this.totalTransactions = transactions.length;
      this.cdr.detectChanges();
    });

    // Load news items
    this.newsService.getNews().subscribe(news => {
      console.log('News loaded:', news);
      this.newsList = news;
      this.cdr.detectChanges();
    });
  }
}
