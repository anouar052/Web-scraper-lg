import puppeteer from "puppeteer";
import promptSync from "prompt-sync";
import fs from "fs";
import { Parser } from "@json2csv/plainjs";
import biougnach from "./sellers/biougnach.js";

const prompt = promptSync();
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

const convert2csv = (data) => {
  try {
    const opts = {};
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    return csv;
  } catch (err) {
    console.error(err);
  }
};

async function main() {
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

  console.log("before biougnach");

  const products_list = await biougnach(page, brand, timer, autoScroll, scroll);

  console.log(products_list);

  const csv = convert2csv(products_list);
  fs.writeFileSync("./products.csv", csv, (err) => {
    if (err) throw err;
    console.log("file saved!");
  });

  await browser.close();
}

async function autoScroll(page, maxScrolls) {
  await page.evaluate(async (maxScrolls) => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var scrolls = 0; // scrolls counter
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++; // increment counter

        // stop scrolling if reached the end or the maximum number of scrolls
        if (
          totalHeight >= scrollHeight - window.innerHeight ||
          scrolls >= maxScrolls
        ) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }, maxScrolls); // pass maxScrolls to the function
}

main();
