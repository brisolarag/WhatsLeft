import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionModel } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.scss',
  providers: [DatePipe]
})
export class TransactionModalComponent implements OnInit {
  @Input() transaction!: TransactionModel;
  @Output() save = new EventEmitter<TransactionModel>();
  @Output() cancel = new EventEmitter<void>();

  expectedDateStr: string = '';
  finalDateStr: string = '';

  constructor(private datePipe: DatePipe) {}

  ngOnInit() {
    if (this.transaction) {
      if (this.transaction.expected) {
        this.expectedDateStr = this.datePipe.transform(this.transaction.expected, 'yyyy-MM-dd') || '';
      }
      if (this.transaction.date) {
        this.finalDateStr = this.datePipe.transform(this.transaction.date, 'yyyy-MM-dd') || '';
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'h') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.tagName === 'INPUT' && activeElement.getAttribute('type') === 'date') {
        event.preventDefault(); // prevent default browser behavior
        const todayStr = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
        
        if (activeElement.id === 'expectedInput') {
          this.expectedDateStr = todayStr;
        } else if (activeElement.id === 'finalInput') {
          this.finalDateStr = todayStr;
        }
      }
    }
    
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }

  onSave() {
    const updated = { ...this.transaction };
    if (this.expectedDateStr) {
      updated.expected = new Date(this.expectedDateStr + 'T12:00:00Z');
    }
    if (this.finalDateStr) {
      updated.date = new Date(this.finalDateStr + 'T12:00:00Z');
    } else {
      updated.date = undefined;
    }
    this.save.emit(updated);
  }

  onCancel() {
    this.cancel.emit();
  }
}
