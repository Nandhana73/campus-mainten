// Quick test for priority detection
const testCases = [
  { desc: "The room fan is running very slow", expected: "Low" },
  { desc: "Light bulb is dim and not bright enough", expected: "Low" },
  { desc: "There is a gas leak in the kitchen", expected: "High" },
  { desc: "Short circuit in the electrical panel", expected: "High" },
  { desc: "Toilet is clogged and overflowing", expected: "High" },
  { desc: "Door handle is loose", expected: "Low" },
  { desc: "Window glass is broken", expected: "High" },
  { desc: "Minor paint damage on the wall", expected: "Low" },
  { desc: "AC not cooling", expected: "Medium" },
  { desc: "Bed is broken and damaged", expected: "Medium" }
];

async function test() {
  for (const tc of testCases) {
    const res = await fetch("http://localhost:5000/api/complaint/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: tc.desc })
    });
    const data = await res.json();
    const status = data.priority === tc.expected ? "✅" : "❌";
    console.log(`${status} "${tc.desc.substring(0,40)}..." => ${data.priority} (expected: ${tc.expected})`);
  }
}

test();

