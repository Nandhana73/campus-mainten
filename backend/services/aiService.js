import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI client
let openai = null;

const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
};

// Fallback rule-based categorization
const ruleBasedCategories = {
  "Furniture / Cleaning": [
    "chair", "table", "desk", "bench", "bed", "mattress", "pillow",
    "cupboard", "almar", "door", "window", "glass", "mirror", "cleaning",
    "dust", "pest", "rodent", "insect", "furniture", "broken", "damaged",
    "cupboard", "almirah", "lock", "handle", "replacement", "repair"
  ],
  "Electrical / Lights": [
    "light", "lamp", "bulb", "led", "fan", "switch", "power", "electric",
    "socket", "wiring", "circuit", "mc", "wire", "voltage", "current",
    "dark", "not working", "no power", "short circuit", "exhaust", "electrical"
  ],
  "Plumbing / Leakage": [
    "water", "leak", "pipe", "tap", "faucet", "drain", "toilet", "bathroom",
    "washroom", "sink", "shower", "water supply", "drainage", "blockage",
    "overflowing", "leaking", "dripping", "sewage", "clogged", "flood", "flooding"
  ],
  "Air Conditioning": [
    "ac", "air conditioner", "cooling", "refrigerator", "fridge", "freezer",
    "temperature", "heat", "warm", "not cooling", "compressor", "gas",
    "refrigerant", "ventilation", "airflow", "vent", "air con", "split ac"
  ]
};

// Fallback rule-based priority detection with improved logic
const detectPriorityRuleBased = (description, problemType) => {
  const text = ((description || "") + " " + (problemType || "")).toLowerCase();
  
  // High priority - safety, urgent, health hazards, structural
  const highPriorityKeywords = [
    // Fire & Safety
    "fire", "smoke", "burning", "explosion", "gas leak", "gas smell",
    "electrical shock", "short circuit", "electrical hazard", "sparks",
    // Water damage & flooding
    "flood", "flooding", "burst pipe", "major leak", "severe leak", "overflowing",
    // Security
    "security", "theft", "break-in", "door lock broken", "lock broken",
    // Health hazards
    "sewage", "sewage backup", "no water", "no water supply",
    "carbon monoxide", "toxic", "hazardous", "dangerous",
    // Structural & broken
    "roof collapse", "ceiling collapse", "structural damage",
    "broken glass", "window crack", "cracked window", "glass broken",
    // Urgent words
    "emergency", "critical", "severe", "urgent", "immediate", "asap"
  ];
  
  // Low priority - cosmetic, minor issues, loose items
  const lowPriorityKeywords = [
    "cosmetic", "minor", "tiny", "little", "slow", "dim", "dust",
    "cleaning", "paint", "wall paint", "replacing", "replacement",
    "rearrange", "adjust", "tighten", "lubricate", "oil",
    "slowly", "not working properly", "slightly", "loose", "loosened"
  ];
  
  // Check for high priority - return immediately if found
  for (const keyword of highPriorityKeywords) {
    if (text.includes(keyword)) {
      return "High";
    }
  }
  
  // Check for low priority - return immediately if found  
  for (const keyword of lowPriorityKeywords) {
    if (text.includes(keyword)) {
      return "Low";
    }
  }
  
  // Default to Medium
  return "Medium";
};

// Rule-based category detection
const detectCategoryRuleBased = (description) => {
  const text = description.toLowerCase();
  
  let maxMatches = 0;
  let detectedCategory = "General Maintenance";
  
  for (const [category, keywords] of Object.entries(ruleBasedCategories)) {
    let matches = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) matches++;
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedCategory = category;
    }
  }
  
  return detectedCategory;
};

// Main AI categorization function with OpenAI fallback to rules
export const analyzeComplaint = async (description, problemType = "") => {
  try {
    const openai = getOpenAI();
    
    // If no API key, use rule-based fallback
    if (!openai || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
      console.log("Using rule-based AI (no OpenAI API key configured)");
      const category = detectCategoryRuleBased(description);
      const priority = detectPriorityRuleBased(description, problemType);
      
      return {
        category,
        priority,
        suggestion: getSuggestion(category, priority),
        source: "rule-based"
      };
    }

    // Use OpenAI for intelligent analysis
    const prompt = `Analyze this maintenance complaint and provide:
1. Category: Choose from "Electrical / Lights", "Plumbing / Leakage", "Air Conditioning", "Furniture / Cleaning", or "General Maintenance"
2. Priority: "High", "Medium", or "Low"
3. A brief suggestion for the maintenance team

Complaint: "${description}"
${problemType ? `Problem Type: "${problemType}"` : ""}

Respond in JSON format:
{
  "category": "...",
  "priority": "...",
  "suggestion": "..."
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a campus maintenance AI assistant. Analyze complaints and categorize them appropriately."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const response = completion.choices[0]?.message?.content;
    
    if (response) {
      try {
        const parsed = JSON.parse(response);
        return {
          category: parsed.category || detectCategoryRuleBased(description),
          priority: parsed.priority || detectPriorityRuleBased(description, problemType),
          suggestion: parsed.suggestion || getSuggestion(parsed.category, parsed.priority),
          source: "openai"
        };
      } catch (parseError) {
        console.log("Failed to parse AI response, using rule-based fallback");
      }
    }
    
    // Fallback if AI fails
    const category = detectCategoryRuleBased(description);
    const priority = detectPriorityRuleBased(description, problemType);
    
    return {
      category,
      priority,
      suggestion: getSuggestion(category, priority),
      source: "rule-based"
    };
    
  } catch (error) {
    console.error("AI Analysis Error:", error.message);
    
    // Fallback to rule-based on error
    const category = detectCategoryRuleBased(description);
    const priority = detectPriorityRuleBased(description, problemType);
    
    return {
      category,
      priority,
      suggestion: getSuggestion(category, priority),
      source: "rule-based"
    };
  }
};

// Get suggestion based on category and priority
const getSuggestion = (category, priority) => {
  const suggestions = {
    "Electrical / Lights": "Check wiring, switches, and circuit breakers. Replace faulty components.",
    "Plumbing / Leakage": "Inspect pipes, taps, and drainage system. Repair leaks immediately.",
    "Air Conditioning": "Check refrigerant levels, clean filters, and inspect compressor.",
    "Furniture / Cleaning": "Assess damage, repair or replace as needed. Schedule deep cleaning.",
    "General Maintenance": "Inspect and assess the issue. Plan appropriate repair."
  };
  
  let suggestion = suggestions[category] || suggestions["General Maintenance"];
  
  if (priority === "High") {
    suggestion = "URGENT: " + suggestion + " Prioritize immediately!";
  }
  
  return suggestion;
};

// Quick AI suggestion for real-time typing
export const quickSuggest = async (description) => {
  if (!description || description.length < 10) {
    return null;
  }
  
  return analyzeComplaint(description);
};

// Export both functions
export default {
  analyzeComplaint,
  quickSuggest
};

