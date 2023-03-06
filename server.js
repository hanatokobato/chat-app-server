const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = require("./app");

app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
