// server/seedProblems.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Problem from "./models/Problem.js";
import TestCase from "./models/TestCase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function connect() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ojdb";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

async function clearExisting() {
  await Problem.deleteMany({});
  await TestCase.deleteMany({});
  console.log("Cleared existing problems and testcases");
}

async function seed() {
  // 1. SUM2 – Sum Two Numbers
  const sum2 = await Problem.create({
    number: 1,
    code: "SUM2",
    title: "Sum Two Numbers",
    statement:
"Given two integers, output their sum. Input: two integers a and b. Output: a + b.",
    statementMarkdown: `
Given two integers \\(a\\) and \\(b\\), output their sum.

**Input:** Two integers \`a\` and \`b\`  
**Output:** \`a + b\`
    `.trim(),
    constraintsMarkdown: `
- \\(1 \\le a, b \\le 10^9\\)  
- Use 64-bit integers (e.g. \`long\` in Java, \`long long\` in C++).
`.trim(),

    editorialMarkdown: `
### Idea

This is a warm-up problem. Read two integers and output their sum.

### Steps

1. Read \`a\` and \`b\` from standard input.  
2. Compute \`a + b\`.  
3. Print the result.

### Complexity

Time: O(1), Memory: O(1).
`.trim(),
          
    difficulty: "Easy",
  });

  await TestCase.create([
    {
      problemId: sum2.id,
      input: "5 7\n",
      expectedOutput: "12\n",
      isSample: true,
    },
    {
      problemId: sum2.id,
      input: "1 2\n",
      expectedOutput: "3\n",
      isSample: true,
    },
  ]);

  // 2. DIFF2 – Difference of Two Numbers
  const diff2 = await Problem.create({
    number: 2,
    code: "DIFF2",
    title: "Difference of Two Numbers",
    statement:
"Given two integers a and b, output a - b. Input: two integers a and b. Output: a - b.",
    statementMarkdown: `
Given two integers \\(a\\) and \\(b\\), output \\(a - b\\).

**Input:** Two integers \`a\` and \`b\`  
**Output:** \`a - b\`
`.trim(),
    constraintsMarkdown: `
- \\(-10^9 \\le a, b \\le 10^9\\)  
- Answer fits in 64-bit signed integer.
    `.trim(),
    difficulty: "Easy",
  });

  await TestCase.create([
    {
      problemId: diff2.id,
      input: "5 7\n",
      expectedOutput: "-2\n",
      isSample: true,
    },
    {
      problemId: diff2.id,
      input: "10 3\n",
      expectedOutput: "7\n",
      isSample: true,
    },
  ]);

  // 3. MAX3 – Maximum of Three Numbers
  const max3 = await Problem.create({
    number: 3,
    code: "MAX3",
    title: "Maximum of Three Numbers",
    statement:
"Given three integers, output the maximum among them. Input: three integers a, b and c. Output: max(a, b, c).",
    statementMarkdown: `
Given three integers \\(a\\), \\(b\\) and \\(c\\), output the maximum of the three.

**Input:** Three integers \`a\`, \`b\` and \`c\`  
**Output:** \`\\max(a, b, c)\`
    `.trim(),
    constraintsMarkdown: `
- \\(-10^9 \\le a, b, c \\le 10^9\\)  
- Use simple comparisons; no special libraries required.
    `.trim(),
    difficulty: "Easy",
  });

  await TestCase.create([
    {
      problemId: max3.id,
      input: "1 2 3\n",
      expectedOutput: "3\n",
      isSample: true,
    },
    {
      problemId: max3.id,
      input: "10 7 10\n",
      expectedOutput: "10\n",
      isSample: true,
    },
  ]);

  console.log("Seeded problems and testcases");
}

async function main() {
  try {
    await connect();
    await clearExisting();
    await seed();
  } catch (err) {
    console.error("Error while seeding:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();