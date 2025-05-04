import { useState} from 'react'

const QuestionForm= () => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState('easy');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('examId', '1'); // Replace with actual exam ID
    formData.append('questionText', questionText);
    formData.append('questionType', questionType);
    formData.append('options', JSON.stringify(options));
    formData.append('correctAnswer', correctAnswer);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('difficulty', difficulty);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Question created:', data);
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Question Text</label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Question Type</label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          <option value="TRUE_FALSE">True/False</option>
          <option value="SHORT_ANSWER">Short Answer</option>
          <option value="IMAGE_UPLOAD">Image Upload</option>
          <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
        </select>
      </div>
      {questionType === 'MULTIPLE_CHOICE' && (
        <div>
          <label>Options</label>
          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              className="w-full p-2 border rounded mb-2"
            />
          ))}
          <button
            type="button"
            onClick={() => setOptions([...options, ''])}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Add Option
          </button>
        </div>
      )}
      <div>
        <label>Correct Answer</label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Upload Image (optional)</label>
        <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Create Question
      </button>
    </form>
  );
};

export default QuestionForm;