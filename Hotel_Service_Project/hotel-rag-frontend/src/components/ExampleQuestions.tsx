interface ExampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const EXAMPLE_QUESTIONS = [
  "What dining options are available at the hotel?",
  "What are the check-in and check-out times?",
  "What amenities are included in the rooms?",
  "Do you have family-friendly services?",
];

export default function ExampleQuestions({ onSelectQuestion }: ExampleQuestionsProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hotel Assistant</h1>
          <p className="text-gray-600">Ask me anything about our hotel services and amenities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXAMPLE_QUESTIONS.map((question, index) => (
            <button
              key={index}
              onClick={() => onSelectQuestion(question)}
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-sm text-gray-700 group-hover:text-blue-700">
                {question}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

