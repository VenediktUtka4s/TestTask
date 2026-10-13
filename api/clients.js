const { runSync } = require("../lib/sync");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    res.statusCode = 200;
    res.end(JSON.stringify(await runSync()));
  } catch (err) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: err.message }));
  }
};
