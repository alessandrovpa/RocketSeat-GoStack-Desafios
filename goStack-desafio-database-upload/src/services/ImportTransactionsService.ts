import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const readStream = fs.createReadStream(filePath);

    const parse = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readStream.pipe(parse);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategory = await categoriesRepository.find({
      where: { title: In(categories) },
    });
    const existentTitles = existentCategory.map(
      (category: Category) => category.title,
    );
    const addCategory = categories
      .filter(category => !existentTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = await categoriesRepository.create(
      addCategory.map(title => ({ title })),
    );

    const allCategories = [...newCategories, ...existentCategory];

    await categoriesRepository.save(newCategories);

    const newTransactions = await transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionsRepository.save(newTransactions);
    await fs.promises.unlink(filePath);

    return newTransactions;
  }
}

export default ImportTransactionsService;
