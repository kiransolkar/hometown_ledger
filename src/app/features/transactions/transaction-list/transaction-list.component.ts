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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransactionService } from '../../../core/services/transaction.service';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-transaction-list',
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
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnInit {
  displayedColumns: string[] = ['memberName', 'year', 'annualFee', 'meetingFine', 'miscFine', 'totalAmount', 'amountPaid', 'pendingAmount', 'date', 'actions'];
  dataSource!: MatTableDataSource<any>;

  selectedYear = '';
  availableYears: number[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private transactionService: TransactionService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.generateYears();
  }

  loadTransactions(): void {
    this.transactionService.getTransactionsWithMemberDetails().subscribe(transactions => {
      this.dataSource = new MatTableDataSource(transactions);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Custom sort for date
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'date':
            return new Date(item.date).getTime();
          default:
            return item[property];
        }
      };
    });
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2024; year--) {
      this.availableYears.push(year);
    }
  }

  applyFilters(): void {
    const year = this.selectedYear ? parseInt(this.selectedYear, 10) : undefined;

    this.transactionService.filterTransactions(year).subscribe(transactions => {
      this.transactionService.getTransactionsWithMemberDetails().subscribe(allTransactionsWithDetails => {
        const filtered = allTransactionsWithDetails.filter(t => {
          let matches = true;
          if (year) {
            matches = matches && t.year === year;
          }
          return matches;
        });
        this.dataSource.data = filtered;
      });
    });
  }

  clearFilters(): void {
    this.selectedYear = '';
    this.loadTransactions();
  }

  openTransactionForm(transaction?: any): void {
    const dialogRef = this.dialog.open(TransactionFormComponent, {
      width: '600px',
      data: transaction || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTransactions();
      }
    });
  }

  deleteTransaction(transaction: any): void {
    if (confirm(`Delete transaction for ${transaction.memberName} (${transaction.year})?`)) {
      this.transactionService.deleteTransaction(transaction.transactionId);
      this.loadTransactions();
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  downloadExcel(): void {
    // Get current data from table (respects filters)
    const dataToExport = this.dataSource.data.map(transaction => ({
      'Member Name': transaction.memberName,
      'Community': transaction.memberCommunity,
      'Year': transaction.year,
      'Annual Fee': transaction.annualFee,
      'Meeting Fine': transaction.meetingFine,
      'Misc Fine': transaction.miscFine,
      'Total Amount': transaction.totalAmount,
      'Amount Paid': transaction.amountPaid,
      'Pending Amount': transaction.pendingAmount,
      'Date': this.formatDate(transaction.date),
      'Notes': transaction.notes || ''
    }));

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Member Name
      { wch: 20 }, // Community
      { wch: 8 },  // Year
      { wch: 12 }, // Annual Fee
      { wch: 14 }, // Meeting Fine
      { wch: 12 }, // Misc Fine
      { wch: 14 }, // Total Amount
      { wch: 14 }, // Amount Paid
      { wch: 16 }, // Pending Amount
      { wch: 15 }, // Date
      { wch: 40 }  // Notes
    ];

    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Generate filename with current date
    const fileName = `Transactions_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  }
}
