import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

// ✅ read file SYNCHRONOUSLY
function syncReadFile(filename: string) {
  const result = readFileSync(join(__dirname, filename), 'utf-8');

  console.log(result); 


  return result;
}

syncReadFile('../logicLanguage.txt').split("\n");
