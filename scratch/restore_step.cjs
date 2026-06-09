const fs = require('fs');
const readline = require('readline');

async function run() {
  const fileStream = fs.createReadStream('C:/Users/siwakorn.r/.gemini/antigravity-ide/brain/72250fb9-ba45-4b57-b02c-0b91fa78ea3c/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1295) {
      const step = JSON.parse(line);
      const toolCall = step.tool_calls[0];
      const args = JSON.parse(typeof toolCall.args === 'string' ? toolCall.args : JSON.stringify(toolCall.args));
      
      console.log("Found step 1312!");
      fs.writeFileSync('scratch/step_1312_chunks.json', JSON.stringify(args, null, 2), 'utf8');
      console.log("Wrote chunks to scratch/step_1312_chunks.json");
      break;
    }
  }
}

run();
