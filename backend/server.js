const express = require("express")
const cors = require("cors") // Import the cors library
const csv = require("csv-parser")
const fs = require("fs")

const app = express()
const port = process.env.PORT || 3000 // Use environment variable for port or default to 3000
app.use(cors())

app.get("/csv-file", (req, res) => {
  const csvFilePath = "../csv/salaries.csv" // Replace with your actual CSV file path
  const jsonData = []

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      jsonData.push(row)
    })
    .on("end", () => {
      res.json(jsonData)
    })
    .on("error", (err) => {
      console.error("Error parsing CSV:", err)
      res.status(500).send("Error converting CSV to JSON")
    })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
