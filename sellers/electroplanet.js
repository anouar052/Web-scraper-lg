import autoScroll from "../utils/autoScroll.js";
const electroplanet = async (page, brand, timer, scroll) => {
  let manufacturerId;
  switch (brand.toUpperCase()) {
    case "LG":
      manufacturerId = "70";
      break;
    case "SAMSUNG":
      manufacturerId = "88";
      break;
  }
  const url = `https://www.electroplanet.ma/tv-photo-video/televiseur/tous-les-televiseur?manufacturer=${manufacturerId}&product_list_dir=asc&product_list_limit=61`;
  console.log(`
---------------------------------------
Electroplanet started
---------------------------------------
`);
  await page.goto(url);
  await page.waitForSelector(".footer-newsletter");

  await timer(1001);

  await autoScroll(page, scroll);

  await timer(2001);

  const products_list = await page.$$eval("li.product-item", (products) =>
    products.map((product) => {
      const name = product
        .querySelector(".product-item-name > a")
        ?.textContent.replace(/\n/g, "");
      const current_price = +product
        .querySelector(
          ".special-price > .price-container > .price-wrapper> .price",
        )
        ?.textContent.replace(/\n|\s/g, "");
      const ref = product.querySelector("span.ref").textContent;
      const status = product.querySelector(".badge-icon")?.textContent;
      const discount = product
        .querySelector(".price-discount-percent")
        ?.textContent.replace(/\n/g, "");
      return { name, ref, status, discount, current_price };
    }),
  );

  return products_list;
};
export default electroplanet;