import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { API_SERVICE } from '../../helpers/api.token';
import { TransactionModel } from '../../models/transaction.model';
import { TransactionModalComponent } from '../../components/transaction-modal/transaction-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TransactionModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private apiService = inject(API_SERVICE);

  // Active Date Context (starts at May 2026 to match image)
  currentDate = new Date(2026, 4, 1);
  monthYearLabel = '';

  // Data Collections
  transactions: TransactionModel[] = [];


  // Dashboard Metrics
  totalIncome = 0;
  totalSpent = 0;
  remaining = 0;

  receivedPercentage = 0;
  spentPercentage = 0;

  // Recent History
  recentHistoryTransactions: TransactionModel[] = [];

  // Transaction Modal State
  selectedTransaction: TransactionModel | null = null;
  isTransactionModalOpen = false;

  // Chart Properties
  chartWidth = 620;
  chartHeight = 220;
  chartPadding = 16;

  // Dynamic arrays
  chartDays: number[] = [];
  xGridCoords: { day: number; x: number }[] = [];
  svgPathIncome = '';
  svgPathSpends = '';

  incomePoints: { x: number; y: number; val: number; day: number }[] = [];
  spentPoints: { x: number; y: number; val: number; day: number }[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.loadData();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.loadData();
  }

  // Modal Handlers
  openTransactionModal(transaction: TransactionModel): void {
    this.selectedTransaction = transaction;
    this.isTransactionModalOpen = true;
  }

  closeTransactionModal(): void {
    this.isTransactionModalOpen = false;
    this.selectedTransaction = null;
  }

  saveTransaction(updatedTransaction: TransactionModel): void {
    if (!updatedTransaction.id) return;
    this.apiService.updateTransaction(updatedTransaction.id, updatedTransaction).subscribe({
      next: () => {
        this.closeTransactionModal();
        this.loadData(); // Reload data to reflect changes
      },
      error: (err) => console.error('Error updating transaction:', err)
    });
  }

  private loadData(): void {
    // Format Header label: e.g. "May 2026"
    this.monthYearLabel = this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    const start = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const end = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    this.apiService.getTransactionFromPeriod(start, end).subscribe(data => {
      this.transactions = data;
      this.calculateMetrics();
      this.extractLists();
      this.generateChartData();
    });
  }

  private calculateMetrics(): void {
    this.totalIncome = 0;
    this.totalSpent = 0;

    // Filter by settled transactions (ones that have a date field populated)
    this.transactions.forEach(t => {
      if (t.date) {
        if (t.type === 'INCOME') {
          this.totalIncome += t.amount;
        } else if (t.type === 'OUTCOME') {
          this.totalSpent += t.amount;
        }
      }
    });

    // Calculate remaining
    this.remaining = this.totalIncome - this.totalSpent;

    // Gauge Percentages (Cap at 100%)
    this.receivedPercentage = Math.min(Math.round((this.totalIncome / 20000) * 100), 100); // 20k limit approx
    this.spentPercentage = Math.min(Math.round((this.totalSpent / 20000) * 100), 100);     // 20k limit approx
  }

  private extractLists(): void {
    // Recent history will now show all transactions for the month, so users can edit them
    // Order by date (or expected if no date) descending
    this.recentHistoryTransactions = this.transactions
      .sort((a, b) => {
        const timeA = a.date ? a.date.getTime() : a.expected.getTime();
        const timeB = b.date ? b.date.getTime() : b.expected.getTime();
        return timeA - timeB; // ascending for neat layout or sorted order
      });
  }

  private generateChartData(): void {
    // 1. Determine days in the current month
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    this.chartDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // 2. Accumulate transactions chronologically
    const rawPoints = this.chartDays.map(day => {
      let incomeSum = 0;
      let spentSum = 0;

      this.transactions.forEach(t => {
        // Ensure t.date and t.expected are Date objects (they might be strings if coming from raw JSON without hydration)
        const tDate = t.date ? new Date(t.date) : new Date(t.expected);
        if (tDate.getDate() <= day) {
          if (t.type === 'INCOME') {
            incomeSum += t.amount;
          } else {
            spentSum += t.amount;
          }
        }
      });
      return { day, incomeSum, spentSum };
    });

    // 3. Determine dynamic scale (min and max values)
    let maxVal = -Infinity;
    let minVal = Infinity;

    rawPoints.forEach(p => {
      maxVal = Math.max(maxVal, p.incomeSum, p.spentSum);
      minVal = Math.min(minVal, p.incomeSum, p.spentSum);
    });

    if (maxVal === -Infinity) maxVal = 100;
    if (minVal === Infinity) minVal = 0;

    // Add a small padding to the scale so lines don't touch the absolute top/bottom
    const range = maxVal - minVal;
    const valuePadding = range === 0 ? 100 : range * 0.1;
    maxVal += valuePadding;
    minVal = Math.max(0, minVal - valuePadding); // Usually keep 0 as floor if it makes sense, but we allow lower if needed

    // 4. Generate visual coordinates
    const wAvailable = this.chartWidth - (this.chartPadding * 2);
    const hAvailable = this.chartHeight - (this.chartPadding * 2);

    this.xGridCoords = this.chartDays.map(day => {
      const x = this.chartPadding + ((day - 1) / (daysInMonth - 1)) * wAvailable;
      return { day, x };
    });

    this.incomePoints = [];
    this.spentPoints = [];

    this.xGridCoords.forEach((coord, i) => {
      const p = rawPoints[i];

      const yIncome = (this.chartPadding + hAvailable) - ((p.incomeSum - minVal) / (maxVal - minVal)) * hAvailable;
      const ySpent = (this.chartPadding + hAvailable) - ((p.spentSum - minVal) / (maxVal - minVal)) * hAvailable;

      this.incomePoints.push({ x: coord.x, y: yIncome, val: p.incomeSum, day: coord.day });
      this.spentPoints.push({ x: coord.x, y: ySpent, val: p.spentSum, day: coord.day });
    });

    // Build SVG paths (Cubic Bezier curve strings for smoothness)
    this.svgPathIncome = this.buildSmoothPath(this.incomePoints);
    this.svgPathSpends = this.buildSmoothPath(this.spentPoints);
  }

  // Generate a beautiful, smooth bezier curve between points
  private buildSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      // Control points
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;

      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    return path;
  }

  // Help format checkmarks depending on settling status
  getForecastCheckClass(desc: string): string {
    if (desc.includes('Rent') || desc.includes('Salary')) return 'check-settled';
    return 'check-pending';
  }

  // Get custom transaction icons based on description keywords
  getTransactionIconClass(desc: string): string {
    const d = desc.toLowerCase();
    if (d.includes('supermarket') || d.includes('groceries') || d.includes('food')) return 'icon-supermarket';
    if (d.includes('uber') || d.includes('car') || d.includes('ride')) return 'icon-uber';
    if (d.includes('project') || d.includes('salary') || d.includes('freelance') || d.includes('card')) return 'icon-project';
    return 'icon-default';
  }
}
