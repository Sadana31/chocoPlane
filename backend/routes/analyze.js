const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({ storage });

router.post("/analyze", upload.array("images"), async (req, res) => {
  try {
    const files = req.files || [];

    let locations = req.body.locations || [];
    if (!Array.isArray(locations)) {
      locations = [locations];
    }

    const runPython = (filePath, location) => {
      return new Promise((resolve, reject) => {
        const python = spawn("python", [
          "python/scripts/analyze.py",
          filePath,
          location,
          req.body.aircraftId,
        ]);
        let result = "";

        python.stdout.on("data", (data) => {
          console.log("PYTHON:", data.toString());

          result += data.toString();
        });

        python.stderr.on("data", (data) => {
          console.error(data.toString());
        });

        python.on("close", () => {
          try {
            // Extract only the JSON array from stdout
            const start = result.indexOf("[{");
            const end = result.lastIndexOf("}]");

            if (start === -1 || end === -1) {
              throw new Error("No JSON array found in Python output.");
            }

            const json = result.substring(start, end + 2);

            const parsed = JSON.parse(json);

            resolve(
              parsed.map((item) => ({
                ...item,
                section: item.section || location,
              })),
            );
          } catch (err) {
            console.error("RAW PYTHON OUTPUT:");
            console.error(result);

            console.error(err);

            resolve([]);
          }
        });
      });
    };

    const analysisPromises = files.map((file, index) => {
      const location = locations[index] || "Unknown";
      return runPython(file.path, location);
    });

    const resultsArray = await Promise.all(analysisPromises);
    const allResults = resultsArray.flat();

    res.json(allResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

module.exports = router;
