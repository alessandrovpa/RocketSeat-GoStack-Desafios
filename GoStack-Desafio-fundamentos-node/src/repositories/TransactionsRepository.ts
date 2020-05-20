import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    // let income = 0;
    // let outcome = 0;
    // this.transactions.map(transaction => {
    //   if (transaction.type === 'income') {
    //     income += transaction.value;
    //     return transaction;
    //   }
    //   outcome += transaction.value;
    //   return transaction;
    // });

    const income = this.transactions
      .map(transaction =>
        transaction.type === 'income' ? transaction.value : 0,
      )
      .reduce((acumulador, atual) => acumulador + atual, 0);
    const outcome = this.transactions
      .map(transaction =>
        transaction.type === 'outcome' ? transaction.value : 0,
      )
      .reduce((acumulador, atual) => acumulador + atual, 0);

    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };
    return balance;
  }

  public create({ title, type, value }: Omit<Transaction, 'id'>): Transaction {
    const { total } = this.getBalance();
    if (type === 'outcome' && value > total) {
      throw Error(
        'should not be able to create outcome transaction without a valid balance',
      );
    }
    const transaction = new Transaction({ title, type, value });
    this.transactions.push(transaction);
    return transaction;
  }
}

export default TransactionsRepository;
