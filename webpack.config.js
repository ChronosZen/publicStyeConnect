const path = require("path");

module.exports = {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  entry: {
    proStart: "./src/proStart.js",
    showServices: "./src/showServices.js",
    edit: "./src/edit.js",
    booking: "./src/booking.js",
    bookingConfirm: "./src/bookingConfirm.js",
    prosDashboard: "./src/prosDashboard.js",
    customerDashboard: "./src/customerDashboard.js",
    customerRegister: "./src/customerRegister.js",
    filterServices: "./src/filterServices.js",
    prosBooking: "./src/prosBooking.js",
    prosGallery: "./src/prosGallery.js",
    login: "/src/login.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  watch: true,
  devtool: "eval-source-map",
};
