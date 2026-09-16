export type DemoItem = {
  prompt: string;
  expected: string;
  tags: string[];
};

export const DEMO_EMAIL = "demo@evalkit.dev";
export const DEMO_PASSWORD = "demo1234";

export const DEMO_DATASET: DemoItem[] = [
  { prompt: "What is 17 × 24?", expected: "408", tags: ["math"] },
  { prompt: "What is the square root of 144?", expected: "12", tags: ["math"] },
  { prompt: "What is 2^10?", expected: "1024", tags: ["math"] },
  { prompt: "What is 15% of 80?", expected: "12", tags: ["math"] },
  { prompt: "What is the GCD of 48 and 18?", expected: "6", tags: ["math"] },
  { prompt: "Simplify 9/12 to lowest terms.", expected: "3/4", tags: ["math"] },
  { prompt: "What is 5 factorial (5!)?", expected: "120", tags: ["math"] },
  { prompt: "Convert binary 1010 to decimal.", expected: "10", tags: ["math", "coding"] },
  { prompt: "In Python, what does len(\"hello\") return?", expected: "5", tags: ["coding"] },
  { prompt: "What HTTP status code means Created?", expected: "201", tags: ["coding"] },
  { prompt: "In JavaScript, what does typeof null return?", expected: "object", tags: ["coding"] },
  { prompt: "What SQL keyword removes duplicate rows from a result?", expected: "DISTINCT", tags: ["coding"] },
  { prompt: "What is the default HTTP port?", expected: "80", tags: ["coding"] },
  { prompt: "What is the zero-based index of the first element in an array?", expected: "0", tags: ["coding"] },
  { prompt: "Which Git command creates a new branch?", expected: "git checkout -b", tags: ["coding"] },
  { prompt: "What does JSON stand for?", expected: "JavaScript Object Notation", tags: ["coding"] },
  { prompt: "According to the refund policy, what is the refund window?", expected: "30 days", tags: ["rag"] },
  { prompt: "What does HTTP 429 mean?", expected: "Too Many Requests", tags: ["rag", "coding"] },
  { prompt: "What is the capital of France?", expected: "Paris", tags: ["rag"] },
  { prompt: "At sea level, at what temperature Celsius does water boil?", expected: "100", tags: ["rag"] },
  { prompt: "What is the default port for PostgreSQL?", expected: "5432", tags: ["rag", "coding"] },
  { prompt: "How many bits are in a SHA-256 digest?", expected: "256", tags: ["rag"] },
  { prompt: "What does UTC stand for?", expected: "Coordinated Universal Time", tags: ["rag"] },
  { prompt: "What GDPR right is also called the right to be forgotten?", expected: "right to erasure", tags: ["rag"] },
  { prompt: "A primary key uniquely identifies what in a table?", expected: "a row", tags: ["rag", "coding"] },
  { prompt: "If all bloops are razzies and some razzies are lazzies, are all bloops lazzies?", expected: "no", tags: ["reasoning"] },
  { prompt: "A bat and a ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost in cents?", expected: "5", tags: ["reasoning", "math"] },
  { prompt: "How many months have 28 days?", expected: "12", tags: ["reasoning"] },
  { prompt: "Which is heavier: a kilogram of feathers or a kilogram of steel?", expected: "they weigh the same", tags: ["reasoning"] },
  { prompt: "If you have three apples and take away two, how many do you have?", expected: "2", tags: ["reasoning"] },
];
