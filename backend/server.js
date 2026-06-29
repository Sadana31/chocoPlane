const express = require("express");
const cors = require("cors");
const path = require("path");

const analysisRoutes = require("./routes/analyze");
const inspectionRoutes = require("./routes/inspections");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", analysisRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.use("/api", inspectionRoutes);

app.use(
  "/graphs",
  express.static(
    path.join(
      __dirname,
      "python",
      "outputs",
      "graphs"
    )
  )
);

app.use(
  "/heatmaps",
  express.static(
    path.join(
      __dirname,
      "python",
      "outputs",
      "heatmaps"
    )
  )
);