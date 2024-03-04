import puppeteer from "puppeteer";
import promptSync from "prompt-sync";
import XLSX from "xlsx";
import biougnach from "./sellers/biougnach.js";
import electroplanet from "./sellers/electroplanet.js";
import scrapeBousfiha from "./sellers/bousfiha.js";

const prompt = promptSync();
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  //Setup
  const brands = prompt("what brand?: ").toUpperCase().split(" ");
  let scroll = +prompt(
    "enter scroll number (1-100 or leave blank to get all items): ",
  );
  let pagination = parseInt(prompt("BOUSFIHA | max pages?: "));
  if (scroll === 0) {
    scroll = undefined;
  }

  if (!brands) return;

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 800,
  });
  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  let final_products_list = [];

  for (let brand of brands) {
    const brand_products_list = await get_products(
      page,
      pagination,
      brand,
      timer,
      scroll,
    );
    final_products_list = [...final_products_list, ...brand_products_list];
  }

  console.log(final_products_list);

  const sheet = XLSX.utils.json_to_sheet(final_products_list);
  const excel = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(excel, sheet, "Sheet1");
  XLSX.writeFile(excel, `${brands.join("_")}_products.xlsx`);

  await browser?.close();
}

const get_products = async (page, pagination, brand, timer, scroll) => {
  const products_list_biougnach = await biougnach(page, brand, timer, scroll);
  const products_list_electroplanet = await electroplanet(
    page,
    brand,
    timer,
    scroll,
  );

  const products_list_bousfiha = await scrapeBousfiha(
    page,
    brand,
    timer,
    pagination,
  );

  const products_list = [
    ...products_list_biougnach,
    ...products_list_electroplanet,
    ...products_list_bousfiha,
  ];
  return products_list;
};

main();
