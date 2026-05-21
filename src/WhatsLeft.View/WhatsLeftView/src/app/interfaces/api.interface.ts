import { Observable } from 'rxjs';
import { TransactionModel, ITransactionCreation } from '../models/transaction.model';

export interface IApiService {

  getTransactions(): Observable<TransactionModel[]>;
  getTransaction(id: string): Observable<TransactionModel  | undefined>;

  addTransaction(transaction: ITransactionCreation): Observable<TransactionModel>;
  updateTransaction(id: string, transaction: ITransactionCreation): Observable<TransactionModel>;
  deleteTransaction(id: string): Observable<void>;

  getTransactionFromPeriod(start: Date, end: Date): Observable<TransactionModel[]>;
}