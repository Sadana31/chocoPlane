// routes/inspections.js
const express = require("express");

const router = express.Router();

const db = require("../firebase");

router.get("/inspections", async (req, res) => {

  try {

    const snapshot =
      await db
        .collection("inspections")
        .get();

    const data =
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

module.exports = router;