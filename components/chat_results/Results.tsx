"use client";

interface ResultsProps {
  messages: { role: string; content: string }[];
}

export const Results: React.FC<ResultsProps> = ({ messages }) => {
  return (
    <div className=" p-4 border-l border-gray-200 ">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index}>
            <p className="font-bold">
              {message.role === "user" ? "You:" : "Assistant:"}
            </p>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Results</h2>
        hello
      </div>
    </div>
  );
};
