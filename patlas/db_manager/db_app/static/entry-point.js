/**
 * This is a script that deals with all the imports for patlas. This then
 * will be the target of webpack to generate a bundle.min.js that is
 * imported in index.html file (the main html).
 */

// import packages from yarn
window.$ = window.jQuery = require("jquery")
require("bootstrap")
require("bootstrap-colorpicker")
require("nouislider")
window.Viva = require("vivagraphjs")
require("bootstrap-table")
require("tableexport.jquery.plugin")
// since the extension doesn't have a npm package... it is available inside
// bootstrap-table
require("bootstrap-table/src/extensions/export/bootstrap-table-export.js")
require("bootstrap-select")
require("bootstrap-toggle")
require("mousetrap")
window.chroma = require("chroma-js")
const Highcharts = window.Highcharts = require("highcharts")
// Load modules after highcharts is loaded
require("highcharts/modules/histogram-bellcurve")(Highcharts)
require("highcharts/modules/heatmap")(Highcharts)
require("highcharts/modules/exporting")(Highcharts)
require("highcharts/modules/offline-exporting")(Highcharts)
require("highcharts/modules/no-data-to-display")(Highcharts)
require("highcharts/modules/boost")(Highcharts)
//require("nouislider") // nouislider needs to be loaded in body...
window.FileSaver = require("file-saver")

// import custom packages/scripts
require("./js/pATLASColorpicker")
require("./js/keyboard_shortcuts")

// import styles from yarn
require("bootstrap/dist/css/bootstrap.min.css")
require("bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css")
require("nouislider/distribute/nouislider.min.css")
require("bootstrap-table/dist/bootstrap-table.min.css")
require("bootstrap-select/dist/css/bootstrap-select.min.css")
require("bootstrap-toggle/css/bootstrap-toggle.min.css")

// import custom stylesheet
require("./css/visualization_functions.css")