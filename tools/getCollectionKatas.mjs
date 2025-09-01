// Run this as
// node getCollectionKatas <collection URL|slug|id>
import { parse } from 'node-html-parser';

if (process.argv.length < 3) {
  console.error(`Usage: node ${process.argv[1]} <collection URL|slug|id>`);
  process.exit(1);
}

const collectionId = process.argv[2].split('/').pop();
const collectionUrl = `https://www.codewars.com/collections/${collectionId}`;

console.log(`Fetching collection from: ${collectionUrl}`);

(async function fetchCollectionKatas() {
  try {
    const response = await fetch(collectionUrl);
    const html = await response.text();
    const doc = parse(html);

    const katas = [... doc.querySelectorAll(".list-item-kata")].map(
      el => ({
        id: el.getAttribute("id"), 
        name: el.getAttribute("data-title")
      })
    );
    console.log(JSON.stringify(katas, null, 2));

  } catch (error) {
    console.error("Failed to fetch collection katas:", error);
  }
})();

