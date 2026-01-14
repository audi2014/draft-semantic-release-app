// beta-fix/test-1
import fs from "fs";
// load ./node_modules/@audi2014/npmjs-test/src/index.ts
const text = fs.readFileSync("./node_modules/@audi2014/npmjs-test/src/index.ts", "utf-8");
console.log(text);
