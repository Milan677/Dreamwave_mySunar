import React, { useState } from "react";
import { GoUpload } from "react-icons/go";

const ImageUploader = ({ onUpload }) => {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/analyze/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error uploading file");
      }

      const data = await res.json();
      setFeedbackText(data.result);
      setLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setLoading(false);
    }
  };

  const renderFeedback = (text) => {
    const sections = text.split("\n\n");

    return sections.map((section, idx) => {
      if (section.trim().startsWith("*")) {
        const bulletItems = section
          .split("\n")
          .filter((line) => line.trim().startsWith("*"))
          .map((item, i) => (
            <li key={i}>{item.replace(/^\* /, "").trim()}</li>
          ));

        return (
          <ul key={idx} className="list-disc pl-5 mb-4 text-sm text-gray-800">
            {bulletItems}
          </ul>
        );
      } else {
        return (
          <p key={idx} className="mb-3 text-sm text-gray-800">
            {section.trim()}
          </p>
        );
      }
    });
  };

  return (
    <div className="space-y-4 w-full">
      <label className="block text-sm font-medium text-gray-700">
        Upload File
      </label>

      <div
        className={`w-full border border-gray-300 bg-gray-100 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all ${
          dragging ? "bg-gray-200" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-8 py-4 rounded-md"
        >
          <GoUpload className="text-2xl mb-1" />
          Upload File
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.png,.jpeg,.jpg,.mp4"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {fileName && (
          <p className="text-sm text-black mt-3 font-bold">
            Uploaded: <span className="text-blue-700">{fileName}</span>
          </p>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Supports PDF, DOCX, PNG, JPEG, JPG & MP4.
        </p>
      </div>

      <div className="flex justify-center mt-4">
        {file && (
          <button
            onClick={handleImageUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition-colors"
          >
            Submit File
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {feedbackText && (
        <div className="mt-6 p-5 bg-green-100 rounded-md shadow-sm">
          <h3 className="text-md font-semibold mb-3 text-green-900">
            Analysis Result:
          </h3>
          {renderFeedback(feedbackText)}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
