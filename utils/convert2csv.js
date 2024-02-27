import { Parser } from "@json2csv/plainjs";

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
export default convert2csv;
