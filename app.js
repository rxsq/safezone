const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Import Routes
const ncrFormsRoutes = require("./routes/ncrForms");
const productsRoutes = require("./routes/products");
const suppliersRoutes = require("./routes/suppliers");
const employeesRoutes = require("./routes/employees");
const positionsRoutes = require("./routes/positions");
const qualityFormsRoutes = require("./routes/qualityForms");
const engineerFormsRoutes = require("./routes/engineerForms");
const purchasingFormsRoutes = require("./routes/purchasingForms");
const statusRoutes = require("./routes/status");
const emailRoutes = require("./routes/emailRoutes");
const pdfRoutes = require("./routes/ncrPdfRoute.js");
const notificationsRoutes = require("./routes/notifications");
const ncrEmployeeRoutes = require("./routes/ncrEmployee");

dotenv.config();

const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Serve the uploaded files from the "uploads" directory
const uploadDir = path.join(__dirname, 'public/assets/data/uploads');
app.use('/assets/data/uploads', express.static(uploadDir));

// JSON middleware to parse JSON bodies
app.use(express.json());

// Route Setup
app.use("/api/ncrForms", ncrFormsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/positions", positionsRoutes);
app.use("/api/qualityForms", qualityFormsRoutes);
app.use("/api/engineerForms", engineerFormsRoutes);
app.use("/api/purchasingForms", purchasingFormsRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/ncrPdfRoute", pdfRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/ncrEmployee", ncrEmployeeRoutes);

// Dynamic route to render other HTML pages
app.get("*", (req, res) => {
  const requestedPath = req.path === "/" ? "/login" : req.path;
  const sanitizedPath = requestedPath.replace(".html", "");
  const filePath = path.join(
    __dirname,
    "public",
    "views",
    `${sanitizedPath}.html`
  );

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("404 Not Found");
    }
    res.sendFile(filePath);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
