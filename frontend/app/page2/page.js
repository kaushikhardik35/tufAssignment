"use client"
import React, { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";

const SubmissionsPage = () => {
   
  const [submissions, setSubmissions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const getLanguageNameById = (id) => {
    const language = languages.find((lang) => lang.id == id);
    return language ? language.name : "Unknown Language";
  };
useEffect(() => {
  const fetchData = async () => {
    try {
            const response2 = await axios.get(
              "http://localhost:1000/getAllLanguages"
            );
            setLanguages(response2.data);
            console.log(languages)
      const response = await axios.get(
        "http://localhost:1000/getAllSubmissions"
      );
      const submissions = response.data;
      setSubmissions(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const fetchInfo = async (token) => {
    try {
      const options = {
        method: "GET",
        url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        params: {
          base64_encoded: "true",
          fields: "*",
        },
        headers: {
          "X-RapidAPI-Key":
            "9f6b4672a5mshcc18e3f3469f035p138d19jsnc3fef65c786b",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  fetchData();
}, []);


  return (
    <div>
      <Head>
        <title>User Submissions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-3xl font-bold mb-4">User Submissions</h1>

        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-800 max-w-95">
            <thead>
              <tr>
                <th className="border border-gray-800 px-4 py-2">Username</th>
                <th className="border border-gray-800 px-4 py-2">Language</th>
                <th className="border border-gray-800 px-4 py-2">
                  Standard Input (stdin)
                </th>
                <th className="border border-gray-800 px-4 py-2">
                  Code (First 100 characters)
                </th>
                <th className="border border-gray-800 px-4 py-2">
                  Submission Timestamp
                </th>
                <th className="border border-gray-800 px-4 py-2">STDOUT</th>
                <th className="border border-gray-800 px-4 py-2">ERROR</th>
                <th className="border border-gray-800 px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr key={index}>
                  <td className="border border-gray-800 px-4 py-2">
                    {submission.username}
                  </td>
                  <td className="border border-gray-800 px-4 py-2">
                    {getLanguageNameById(submission.code_language)}
                  </td>
                  <td className="border border-gray-800 px-4 py-2">
                    {Buffer.from(submission.stdin, "base64")
                      .toString("utf-8")
                      .slice(0, 100)}
                  </td>
                  <td className="border border-gray-800 px-4 py-2">
                    {Buffer.from(submission.code, "base64")
                      .toString("utf-8")
                      .slice(0, 100)}
                  </td>
                  <td className="border border-gray-800 px-4 py-2">
                    {submission.submission_time}
                  </td>
                  <td className="border border-gray-800 px-4 py-2">
                    {submission.status !== "Processing" && submission.output
                      ? Buffer.from(submission.output, "base64")
                          .toString("utf-8")
                          .slice(0, 100)
                      : ""}
                  </td>

                  <td className="border border-gray-800 px-4 py-2">
                    {submission.status !== "Processing" && submission.error
                      ? Buffer.from(submission.error, "base64")
                          .toString("utf-8")
                          .slice(0, 100)
                      : ""}
                  </td>

                  <td className="border border-gray-800 px-4 py-2">
                    {submission.status} <br />
                    {submission.token}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};


export default SubmissionsPage;
