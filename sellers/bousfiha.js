const fetchProducts = async (page, products_list, brand) => {
  const products_scrape = await page.$$eval("h5.product-title > a", (links) =>
    links.map((link) => link.href),
  );

  const protoProducts = products_scrape.slice(0, 3);
  for (const product of protoProducts) {
    try {
      const retailer = "bousfiha";
      await page.goto(product);
      await page.waitForSelector(".product-reference > span");
      const status = await page.$(".on-sale-label")?.textContent;
      const name = await page.$eval(".product-name", (element) =>
        element?.textContent?.trim(),
      );
      const ref = await page.$eval(".product-reference span", (element) =>
        element.textContent.trim(),
      );
      const current_price = await page.$eval(
        '.current-price span[itemprop="price"]',
        (element) =>
          +element.textContent
            .trim()
            .replace(/[^\d,]/g, "")
            .replace(",", "."),
      );
      products_list.push({ brand, name, ref, status, current_price, retailer });
    } catch (error) {
      console.error("Error fetching product reference:", error);
    } finally {
      await page.goBack();
    }
  }
};

const scrapeBousfiha = async (page, brand, timer) => {
  let url;
  switch (brand) {
    case "LG":
      url = "https://electrobousfiha.com/188-televiseur?q=Marque-LG";
      break;
    case "SAMSUNG":
      url = "https://electrobousfiha.com/188-televiseur?q=Marque-Samsung";
      break;
    default:
      url = "https://electrobousfiha.com/188-televiseur?q=Marque-LG";
  }

  console.log("---------------------------------------");
  console.log("Bousfiha started");
  console.log("---------------------------------------");

  try {
    await page.goto(url);
    await page.waitForSelector(".pagination");

    const pageNumber = (await page.$$(".pagination ul > li")).length - 1;
    const products_list = [];

    for (let i = 0; i < pageNumber; i++) {
      await fetchProducts(page, products_list, brand);
      await timer(1000);
      const nextButton = await page.$("a.next");
      if (nextButton) {
        await nextButton.click();
        await page.waitForNavigation();
      } else {
        break;
      }
    }

    console.log(products_list.length);
    return products_list.map((product) => ({ brand, ...product }));
  } catch (error) {
    console.error("Error during scraping:", error);
    return [];
  } finally {
    console.log("---------------------------------------");
    console.log("Bousfiha ended");
  }
};

export default scrapeBousfiha;
