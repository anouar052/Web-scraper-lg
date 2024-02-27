import puppeteer from "puppeteer";
import promptSync from "prompt-sync";
import fs from "fs";
import biougnach from "./sellers/biougnach.js";
import convert2csv from "./utils/convert2csv.js";
import electroplanet from "./sellers/electroplanet.js";

const prompt = promptSync();
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  //Setup
  const brand = prompt("what brand?:");
  let scroll = +prompt(
    "enter scroll number (1-100 or leave blank to get all items): ",
  );
  if (scroll === 0) {
    scroll = undefined;
  }

  if (!brand) return;

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

  const products_list_biougnach = await biougnach(page, brand, timer, scroll);
  const products_list_electroplanet = await electroplanet(
    page,
    brand,
    timer,
    scroll,
  );

  const products_list = products_list_electroplanet.concat(
    products_list_biougnach,
  );

  console.log(products_list);

  const csv = convert2csv(products_list);
  fs.writeFileSync("./products.csv", csv, (err) => {
    if (err) throw err;
    console.log("file saved!");
  });

  await browser.close();
}

main();
