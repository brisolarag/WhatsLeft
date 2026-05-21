import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IApiService } from '../interfaces/api.interface';
import { TransactionModel, ITransactionCreation } from '../models/transaction.model';
import mockdb from '../helpers/mockdb.json';

@Injectable({
  providedIn: 'root'
})
export class MockApiService implements IApiService {
  private transactions: TransactionModel[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    // Map JSON date strings to actual Date objects
    this.transactions = (mockdb as any[]).map((t, index) => ({
      id: t.id || `t-generated-${index}`,
      type: t.type,
      description: t.description,
      amount: Number(t.amount),
      expected: new Date(t.expected),
      date: t.date ? new Date(t.date) : undefined,
      tags: Array.isArray(t.tags) ? t.tags : []
    }));
  }

  getTransactions(): Observable<TransactionModel[]> {
    // Return a clone to prevent direct outside mutations
    return of([...this.transactions]);
  }

  getTransaction(id: string): Observable<TransactionModel | undefined> {
    const item = this.transactions.find(t => t.id === id);
    return of(item ? { ...item } : undefined);
  }

  addTransaction(transaction: ITransactionCreation): Observable<TransactionModel> {
    const newTransaction: TransactionModel = {
      id: `t-created-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: transaction.type,
      description: transaction.description,
      amount: Number(transaction.amount),
      expected: transaction.expected instanceof Date ? transaction.expected : new Date(transaction.expected),
      date: transaction.date ? (transaction.date instanceof Date ? transaction.date : new Date(transaction.date)) : undefined,
      tags: Array.isArray(transaction.tags) ? transaction.tags : []
    };
    
    this.transactions.push(newTransaction);
    return of({ ...newTransaction });
  }

  updateTransaction(id: string, transaction: ITransactionCreation): Observable<TransactionModel> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Transaction with ID ${id} not found.`);
    }

    const updatedTransaction: TransactionModel = {
      id,
      type: transaction.type,
      description: transaction.description,
      amount: Number(transaction.amount),
      expected: transaction.expected instanceof Date ? transaction.expected : new Date(transaction.expected),
      date: transaction.date ? (transaction.date instanceof Date ? transaction.date : new Date(transaction.date)) : undefined,
      tags: Array.isArray(transaction.tags) ? transaction.tags : []
    };

    this.transactions[index] = updatedTransaction;
    return of({ ...updatedTransaction });
  }

  deleteTransaction(id: string): Observable<void> {
    this.transactions = this.transactions.filter(t => t.id !== id);
    return of(void 0);
  }

  getTransactionFromPeriod(start: Date, end: Date): Observable<TransactionModel[]> {
    const startTime = start.getTime();
    const endTime = end.getTime();

    const filtered = this.transactions.filter(t => {
      const targetTime = t.date ? t.date.getTime() : t.expected.getTime();
      return targetTime >= startTime && targetTime <= endTime;
    });

    return of(filtered.map(t => ({ ...t })));
  }
}
