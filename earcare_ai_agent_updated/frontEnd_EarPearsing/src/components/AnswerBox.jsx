const AnswerBox = ({ response }) => {
  if (!response) return null;

  return (
    <div className="bg-gray-100 p-4 mt-4 rounded shadow">
      <h2 className="font-bold mb-2">AI Response:</h2>
      <p className="whitespace-pre-wrap text-gray-700">{response}</p>
    </div>
  );
};

export default AnswerBox;
