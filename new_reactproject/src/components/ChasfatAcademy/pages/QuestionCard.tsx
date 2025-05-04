import React, { useState } from 'react';

interface QuestionCardProps {
  question: {
    id: number;
    questionText: string;
    questionType: string;
    options?: string[];
    imageUrl?: string;
  };
  onAnswerSelect: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswerSelect }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(e.target.value);
    onAnswerSelect(e.target.value);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">{question.questionText}</h3>
      {question.imageUrl && <img src={question.imageUrl} alt="Question" className="mb-4" />}
      {question.questionType === 'MULTIPLE_CHOICE' && (
        <div>
          {question.options?.map((option, index) => (
            <label key={index} className="block mb-2">
              <input
                type="radio"
                name="answer"
                value={option}
                onChange={handleAnswerChange}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      )}
      {question.questionType === 'TRUE_FALSE' && (
        <div>
          <label className="block mb-2">
            <input type="radio" name="answer" value="True" onChange={handleAnswerChange} className="mr-2" />
            True
          </label>
          <label className="block mb-2">
            <input type="radio" name="answer" value="False" onChange={handleAnswerChange} className="mr-2" />
            False
          </label>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;