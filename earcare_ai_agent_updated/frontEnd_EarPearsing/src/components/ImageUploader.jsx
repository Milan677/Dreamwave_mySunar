import React, { useState } from "react";
import { GoUpload } from "react-icons/go";
 
const ImageUploader = ({ onUpload }) => {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Feedback, setFeedback] = useState([]);
 
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      // onUpload(selectedFile);
    }
  };
 
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      // onUpload(droppedFile);
    }
  };
 
  const handleImageUpload = async (e) => {
    e.preventDefault();
    console.log('analyze button clicked');
    // if (!uploadedFile) {
    //   alert("No file selected for upload");
    //   return;
    // }
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
      setFeedback(data.result);
      setLoading(false);
      console.log("first", data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
 
  return (
    <div className="space-y-2 w-full">
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
          Supports PDF, DOCX, (PNG, JPEG, JPG) & MP4.
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
      {Feedback.length > 0 && (
        <div className="mt-4 p-4 bg-green-100 text-black rounded-md">
          <h3 className="font-semibold">Analysis Result:</h3>
          <p>{Feedback}</p>
        </div>
      )}
    </div>
  );
};
 
export default ImageUploader;