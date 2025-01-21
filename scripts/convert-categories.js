import pkg from 'xlsx';
const { readFile, utils } = pkg;
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function convertCategories() {
  try {
    const workbook = readFile('attached_assets/Categories.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawCategories = utils.sheet_to_json(sheet);

    console.log('Raw categories:', rawCategories);

    // Group by Category and transform the data
    const groupedCategories = rawCategories.reduce((acc, row) => {
      const categoryName = row.Category;
      const itemName = row.Items;

      if (!categoryName || !itemName) {
        console.warn('Invalid row:', row);
        return acc;
      }

      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }

      acc[categoryName].push({
        id: itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: itemName,
      });

      return acc;
    }, {});

    // Convert to final format
    const transformedCategories = Object.entries(groupedCategories).map(([category, items]) => ({
      id: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: category,
      items: items
    }));

    // Create the directory if it doesn't exist
    const outputDir = join('client', 'public', 'data');

    // Write to a JSON file in the public directory
    await writeFile(
      join(outputDir, 'categories.json'),
      JSON.stringify(transformedCategories, null, 2)
    );

    console.log('Categories converted successfully!');
    console.log('Transformed categories:', transformedCategories);
  } catch (error) {
    console.error('Error converting categories:', error);
    console.error('Stack trace:', error.stack);
  }
}

convertCategories();