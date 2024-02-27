import autoScroll from "../utils/autoScroll.js";
const biougnach = async (page, brand, timer, scroll) => {
  const url = "https://www.biougnach.ma/shop/search/VFY%3D";
  console.log(`
---------------------------------------
Biougnach started
---------------------------------------
`);
  await page.goto(url);
  await page.waitForSelector(".filter__title");

  let inputs = [];
  await timer(1000);
  const filters = await page.$$(".filter-list__item");
  for (const filter of filters) {
    const input = await filter.$(".filter-list__input");
    const label = await filter.$eval(
      ".filter-list__title",
      (el) => el.textContent,
    );
    inputs.push({ input, label });
  }

  const lg_filter = inputs.filter((input) =>
    input.label.includes(brand.toUpperCase()),
  )[0].input;
  await lg_filter.$eval("input", (check) => check.click());

  await timer(1000);

  await autoScroll(page, scroll);

  await timer(2000);

  const products_list = await page.$$eval(".product-card", (products) =>
    products.map((product) => {
      const name = product.querySelector(
        ".product-card__name > a",
      )?.textContent;
      const current_price_str = product.querySelector(
        ".product-card__prices > span.product-card__new-price",
      )
        ? product.querySelector("span.product-card__new-price")?.textContent
        : product.querySelector(".product-card__prices")?.textContent;
      const current_price = parseFloat(
        current_price_str.replace(/DH|\\s/g, ""),
      );
      const ref = product
        .querySelector("ul.product-card__features-list >li:first-child")
        .textContent.replace(" Référence: ", "");
      if (product.querySelector(".product-card__badge")) {
        const status = product.querySelector(
          ".product-card__badge",
        ).textContent;
        return { name, ref, current_price, status };
      }
      return { name, ref, current_price };
    }),
  );
  return products_list;
};
export default biougnach;
