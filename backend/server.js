const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { query } = require("./database");
dotenv.config();
const axios = require("axios");
const app = express();
const { createClient } = require("redis");
const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

const port = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());
app.get("/updateTable",async(req,res)=>{
    const result = await query(`ALTER TABLE submissions
ADD COLUMN status TEXT;

`);
    res.send(result);
})
app.get("/updateTable2", async (req, res) => {
  const result = await query(`DELETE from submissions

`);
await client.del("allSubmissions");
  res.send(result);
});

// Your routes go here
app.post("/submission", async (req, res) => {
    //console.log(req.body);
    
const options = {
  method: "POST",
  url: "https://judge0-ce.p.rapidapi.com/submissions",
  params: {
    base64_encoded: "true",
    fields: "*",
  },
  headers: {
    "content-type": "application/json",
    "Content-Type": "application/json",
    "X-RapidAPI-Key": "9f6b4672a5mshcc18e3f3469f035p138d19jsnc3fef65c786b",
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  },
  data: {
    language_id: req.body.selectedLanguage,
    source_code:req.body.code,
    stdin: req.body.stdin,
  },
};

try {
  const response = await axios.request(options);
  const { username, selectedLanguage, code, stdin } = req.body; 
   const insertQuery = `
      INSERT INTO submissions (username, code_language, code, stdin,token,status)
      VALUES ('${username}', '${selectedLanguage}', '${code}', '${stdin}','${
     response.data.token
   }','Processing')
    `;

   // Execute the query with parameters
   const result = await query(insertQuery, [
     username,
     selectedLanguage,
     code,
     stdin,
     response.data.token,
     'Processing'
   ]);

     const response2 = await query(`SELECT * from submissions
`);
     await client.set("allSubmissions", JSON.stringify(response2));

   res.send("OK");
} catch (error) {
  console.error(error);
}
});


app.get("/getAllLanguages", async (req, res) => {
   // await client.del("languages")
  try {
    const cachedData =  await client.get("languages");

    if (cachedData) {
      // If data is found in the cache, return cached data
      console.log("Data found in cache");
     // console.log(cachedData);
      res.send(JSON.parse(cachedData));
    } else {
      // If data is not found in the cache, fetch from the API and cache it
      const options = {
        method: "GET",
        url: "https://judge0-ce.p.rapidapi.com/languages",
        headers: {
          "X-RapidAPI-Key":
            "9f6b4672a5mshcc18e3f3469f035p138d19jsnc3fef65c786b",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);
      const responseData = response.data;

      // Cache the fetched data in Redis with an expiration time of 1 hour (3600 seconds)
      await client.set("languages", JSON.stringify(responseData));

      res.send(responseData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});app.get("/getAllSubmissions", async (req, res) => {
  try {
    let cachedData = await client.get("allSubmissions");

    if (cachedData) {
      console.log("Data found in cache");
      cachedData = JSON.parse(cachedData);
      for (let c of cachedData) {
        if (c.status == "Processing") {
          try {
            const options = {
              method: "GET",
              url: `https://judge0-ce.p.rapidapi.com/submissions/${c.token}`,
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
            if (response.data) {
              c.status = response.data.status.description;
              c.output = response.data.stdout;
              c.error = response.data.stderr;
              const updateQuery = `
                UPDATE submissions 
                SET status = '${response.data.status.description}', output = '${response.data.stdout}', error = '${response.data.stderr}'
                WHERE token = '${c.token}';
            `;
              await query(updateQuery, [c.status, c.output, c.error, c.token]);

            }
          } catch (error) {
            console.error("Error fetching submission data:", error);
          }
        }
      }
      await client.set("allSubmissions", JSON.stringify(cachedData));
      res.send(cachedData);
    } else {
      const response = await query(`SELECT * from submissions`);
      await client.set("allSubmissions", JSON.stringify(response));
      res.send(response);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(port,async () => {
  console.log(`Server is running on port ${port}`);
  client.connect();
});
