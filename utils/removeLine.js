const removeLine = async (str) => {
  console.log("Remove Line");
  if (!str.contain("\\n")) return;
  await str.replace(/\n/g, "");
  return str;
};

export default removeLine;
