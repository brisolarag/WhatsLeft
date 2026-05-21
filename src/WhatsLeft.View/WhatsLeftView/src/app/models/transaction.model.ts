export interface TransactionModel {
    id: string;
    type: string;
    description?: string;
    amount: number;
    expected: Date;
    date?: Date;
    tags: string[];
}

export interface ITransactionCreation {
    type: string;
    description?: string;
    amount: number;
    expected: Date;
    date?: Date;
    tags: string[];
}   