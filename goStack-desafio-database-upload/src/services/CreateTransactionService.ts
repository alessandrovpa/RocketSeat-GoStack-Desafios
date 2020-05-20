import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    const balance = await transactionsRepository.getBalance();

    if (value > balance.total && type === 'outcome') {
      throw new AppError('C n tem tanto dinheiro assim nao irmão');
    }

    let idCategory: string;
    const categoryExist = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
    if (categoryExist) {
      idCategory = categoryExist.id;
    } else {
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
      idCategory = newCategory.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: idCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
