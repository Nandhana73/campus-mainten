// Test AI endpoints
const testAI = async () => {
  const testCases = [
    "Water leaking from the bathroom pipe, severe flooding",
    "Light bulb is not working in the room",
    "AC is not cooling properly, room is very hot",
    "Chair is broken and needs replacement",
    "Fire in the laboratory, immediate danger!"
  ];

  console.log("Testing AI endpoints at http://localhost:5000...\n");

  for (const description of testCases) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch("http://localhost:5000/api/complaint/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const text = await res.text();
      console.log("Raw response:", text.substring(0, 200));
      
      const data = JSON.parse(text);
      console.log(`Description: "${description.substring(0, 50)}..."`);
      console.log(`  → Category: ${data.suggestedCategory}`);
      console.log(`  → Priority: ${data.priority}`);
      console.log(`  → Source: ${data.source}`);
      console.log("");
    } catch (err) {
      console.error("Error:", err.message);
    }
  }
};

testAI();

