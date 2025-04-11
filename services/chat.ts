export async function analyzeFile(dataAttachments: string[]) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputData: dataAttachments }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.body;
}
