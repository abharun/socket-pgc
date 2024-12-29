import React, { useState, useRef } from "react";
import { withMainlayout } from "../layouts";

export const Dashboard: React.FC = withMainlayout(() => {
  const [selectedText, setSelectedText] = useState("");
  const [editorText, setEditorText] = useState("");
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const textRef = useRef<HTMLInputElement>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPopupPosition({ x: rect.left, y: rect.top + window.scrollY + 10 });
      setSelectedText(selection.toString());
    } else {
      setPopupPosition(null);
    }
  };

  const handleRequest = async (action: string) => {
    try {
      const payload = {
        text: selectedText,
        command: action,
      };

      const response = await fetch("http://127.0.0.1:8080/proc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setEditorText(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setPopupPosition(null);
    }
  };

  return (
    <div className="relative p-4">
      <input
        ref={textRef}
        onMouseUp={handleMouseUp}
        className="relative border p-4 rounded-md bg-gray-100 text-gray-800 w-full"
        placeholder="Edit text here with AI."
        value={editorText}
        onChange={(e) => setEditorText(e.target.value)}
      />

      {popupPosition && (
        <div
          className="relative w-max bg-white shadow-lg border p-2 rounded flex space-x-2"
          style={{ top: popupPosition.y, left: popupPosition.x }}
        >
          <button
            onClick={() => handleRequest("paraphrase")}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Paraphrasing
          </button>
          <button
            onClick={() => handleRequest("expand")}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Expanding
          </button>
          <button
            onClick={() => handleRequest("summarize")}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Summarizing
          </button>
          <button
            onClick={() => handleRequest("translate")}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Translating
          </button>
        </div>
      )}
    </div>
  );
});
