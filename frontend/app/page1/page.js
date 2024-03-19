"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";


function NextPage() {
    const router = useRouter();
  const [username, setUsername] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1000/getAllLanguages"
        );
        setLanguages(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async  (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (!username || !selectedLanguage || !code  ) {
      alert("All fields are required!");
      return;
    }

await axios.post("http://localhost:1000/submission", {
  username: username,
  selectedLanguage: selectedLanguage,
  code: Buffer.from(code, "utf-8").toString("base64"),
  stdin: Buffer.from(stdin, "utf-8").toString("base64"),
});

    // Redirect to another page after submission (e.g., home page)
    router.push("/page2");
  };

  return (
    <div className="min-h-screen w-200 bg-gray-200 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Username:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Language:
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            required
          >
            <option value="">Select Language</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Code:
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows="20"
            cols="100"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Standard Input (stdin):
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows="10"
            cols="100"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default NextPage;
