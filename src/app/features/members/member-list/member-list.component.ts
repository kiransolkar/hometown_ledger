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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MemberService } from '../../../core/services/member.service';
import { Member } from '../../../shared/models/member.model';

@Component({
  selector: 'app-member-list',
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
    MatSelectModule,
    MatChipsModule
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {
  displayedColumns: string[] = ['memberId', 'fullName', 'community', 'phoneNumber', 'emailAddress', 'actions'];
  dataSource!: MatTableDataSource<Member>;
  searchTerm = '';
  selectedCommunity = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private memberService: MemberService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.memberService.getMembers().subscribe(members => {
      this.dataSource = new MatTableDataSource(members);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Custom filter predicate
      this.dataSource.filterPredicate = (data: Member, filter: string) => {
        const searchStr = filter.toLowerCase();
        return data.fullName.toLowerCase().includes(searchStr) ||
               data.emailAddress.toLowerCase().includes(searchStr) ||
               data.phoneNumber.includes(searchStr) ||
               data.community.toLowerCase().includes(searchStr);
      };
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByCommunity(): void {
    if (this.selectedCommunity) {
      this.memberService.filterByCommunit(this.selectedCommunity as 'Mumbai' | 'Salpewadi').subscribe(members => {
        this.dataSource.data = members;
      });
    } else {
      this.loadMembers();
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCommunity = '';
    this.dataSource.filter = '';
    this.loadMembers();
  }

  viewMember(member: Member): void {
    this.router.navigate(['/members', member.memberId]);
  }

  addNewMember(): void {
    this.router.navigate(['/members', 'new']);
  }
}
