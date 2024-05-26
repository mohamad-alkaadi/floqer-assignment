import { useEffect, useState } from "react"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import { ChartContainer } from "@mui/x-charts/ChartContainer"
import { BarPlot } from "@mui/x-charts/BarChart"
import { ChartsXAxis } from "@mui/x-charts/ChartsXAxis"
import { ResponsiveChartContainer } from "@mui/x-charts/ResponsiveChartContainer"
import { MarkPlot } from "@mui/x-charts/LineChart"
import CloseIcon from "@mui/icons-material/Close"
function App() {
  const [data, setData] = useState([])
  const [summaryData, setSummaryData] = useState([])
  const [distinctYears, setDistinctYears] = useState()
  const [xLabelsAndData, setXLabelsAndData] = useState([])
  const [isResponsive, setIsResponsive] = useState(false)
  const [secondTableSummery, setSecondTableSummery] = useState([])
  const [selectedYear, setSelectedYear] = useState(0)
  const getDistinctYears = (data) => {
    const years = data.map((item) => item.work_year)
    return [...new Set(years)]
  }
  console.log("secondTableSummery", secondTableSummery)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/csv-file")
        const jsonData = await response.json()
        setData(jsonData)
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    setDistinctYears(getDistinctYears(data))
  }, [data])

  useEffect(() => {
    if (distinctYears !== undefined) {
      for (let i = 0; i < distinctYears.length; i++) {
        let salaries = 0
        const jobsInYear = data.filter((d) => d.work_year === distinctYears[i])
        const jobsInYearCount = jobsInYear.length
        for (let x = 0; x < jobsInYear.length; x++) {
          salaries += parseInt(jobsInYear[x].salary, 10)
        }

        let avgSalary = salaries / jobsInYear.length
        setSummaryData((prev) => [
          ...prev,
          {
            year: distinctYears[i],
            totalJobs: jobsInYearCount,
            averageSalary: avgSalary,
          },
        ])
        setSummaryData((prev) => prev.sort((a, b) => b.year - a.year))
        setXLabelsAndData((prev) => [
          ...prev,
          { year: distinctYears[i], data: jobsInYearCount },
        ])
      }
    }
    setXLabelsAndData((prev) => prev.sort((a, b) => a.year - b.year))
  }, [distinctYears])

  const Container = isResponsive ? ResponsiveChartContainer : ChartContainer
  const sizingProps = isResponsive ? {} : { width: 500, height: 300 }

  const getJobs = (year) => {
    setSelectedYear(year)
    let jobs = []
    jobs = data
      .filter((i) => i.work_year === year)
      .map((item) => item.job_title)

    const count = {}
    jobs.forEach(function (item) {
      count[item] = (count[item] || 0) + 1
    })

    console.log(count)
    setSecondTableSummery(count)
  }

  const handleCloseSecondTable = () => {
    setSecondTableSummery([])
    setSelectedYear(0)
  }
  return (
    <div>
      <h1 className="text-center text-4xl mt-10 mb-10">Main Table</h1>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell>Total Jobs</TableCell>
              <TableCell>Average Salary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summaryData.map((row) => (
              <TableRow key={row.year}>
                <TableCell onClick={() => getJobs(row.year)}>
                  {row.year}
                </TableCell>
                <TableCell onClick={() => getJobs(row.year)}>
                  {row.totalJobs}
                </TableCell>
                <TableCell onClick={() => getJobs(row.year)}>
                  {row.averageSalary.toFixed(2)} $
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper
        sx={{
          width: "100%",
          height: 300,
          display: "flex",
          justifyContent: "center",
        }}
        elevation={3}
      >
        <Container
          series={[
            {
              type: "bar",
              data: xLabelsAndData.map((item) => item.data),
            },
          ]}
          xAxis={[
            {
              data: xLabelsAndData.map((item) => item.year),
              scaleType: "band",
              id: "x-axis-id",
            },
          ]}
          {...sizingProps}
        >
          <BarPlot />
          <MarkPlot />
          <ChartsXAxis
            label="Total jobs in each year"
            position="bottom"
            axisId="x-axis-id"
          />
        </Container>
      </Paper>
      {selectedYear !== 0 ? (
        <div className="mt-10 mb-10 flex justify-between items-center mr-4 ml-4">
          <div className="text-[30px]">{selectedYear} Jobs</div>
          <CloseIcon
            onClick={() => handleCloseSecondTable()}
            sx={{ cursor: "pointer", fontSize: "30px" }}
          />
        </div>
      ) : (
        ""
      )}
      {secondTableSummery.length === 0 ? null : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job</TableCell>
                <TableCell>Number of jobs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(secondTableSummery).map(([key, value]) => {
                return (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  )
}

export default App
