import * as fs from 'fs';
import * as path from 'path';

export interface TestData {
  baseUrl: string;
  searchTerm: string;
  categoryPath: string[];
  filter: {
    name: string;
    value: string;
  };
}

export function readTestData(): TestData {
  const filePath = path.join(__dirname, '..', 'data', 'testData.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as TestData;
}