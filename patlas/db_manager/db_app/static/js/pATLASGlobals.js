/**
 * A bunch of global functions to be used throughout patlas
 */

const version = "1.4.0"

/**
 * variable that will store the object to be exported to a json file on
 * "projects export"
 * @type {Object}
 */
let typeOfProject = {
  version,
  "taxa": false,
  "resistance": false,
  "plasmidfinder": false,
  "virulence": false,
  "intersection": false,
  "union": false,
  "mapping": false,
  "mashscreen": false,
  "assembly": false,
  "consensus": false
}

// if this is a developer session please enable the below line of code
const devel = false

// boolean that controls the prerender function if rerun
// is activated
// let rerun = false

// helps set menu to close status
let firstClickMenu = true

// checks if vivagraph should load first initial dataset or the filters
let firstInstace = true
// variable to check if page was reloaded
let pageReload = false
// variable to check if page was rerun for pffamilies and resistance
// filtering to work properly
let pageReRun = false

// starts a global instance for checking if button was clicked before
// let clickedPopupButtonRes = false
let clickedPopupButtonCard = false
let clickedPopupButtonFamily = false
let clickedPopupButtonVir = false

// variable to control stats displayer
let areaSelection = false


const getArray = (devel === true) ? $.getJSON("/test") : $.getJSON("/fullDS")
// an array to store bootstrap table related list for downloads and coloring
// nodes on submit
let bootstrapTableList = []
// dictionary to store all the connections between species and other taxa
// level available. This needs to be stored here because there is no reason
// to execute the getArrayTaxa twice.
// const dictGenera = {}

// buttonSubmit current node
let currentQueryNode = false

let masterReadArray = []

let readFilejson = false
let mashJson = false
let assemblyJson = false
let consensusJson = false
let projectJson = false

let readIndex = 0

let clickedHighchart = false

let graphSize

// let totalNumberOfLinks

/**
 * variable that stores the multi selection overlay object
 * type {boolean|Object}
 */
let multiSelectOverlayObj = false

let legendInst

// object that lets collect plot data and that enable to click on bars and
// retrieve selected nodes in vivagraph
let associativeObj = {}

// globals to control plot instances
let clickerButton

let listPlots

let requestDBList

// legend slider controller vars
let legendSliderControler = [
  "#taxaModalSubmit",
  "#resSubmit",
  "#pfSubmit",
  "#virSubmit"
]

let selectedFilter
let legendIndex = 0

/**
 * load JSON file with taxa dictionary
 * @returns {Object} - return is an object that perform matches between taxa
 * levels species, genera, families and orders.
 */
const getArrayTaxa = () => {
  return $.getJSON("/taxa")
}

/**
 * load JSON file with resistance dictionary
 * @returns {Object} - returns an object that allows resistance menus to be
 * populated
 */
const getArrayRes = () => {
  return $.getJSON("/resistance")
}

/**
 * load JSON file with plasmidfinder dictionary
 * @returns {Object} - returns an object that allows plasmidfinder menus
 * to be populated
 */
const getArrayPf = () => {
  return $.getJSON("/plasmidfinder")
}

/**
 * load JSON file with virulence dictionary
 * @returns {Object} - returns an object that allows virulence menus
 * to be populated
 */
const getArrayVir = () => {
  return $.getJSON("/virulence")
}

/**
 * This is list is the master list that controls every selection made in patlas.
 * It controls selections made through filters, file input and is used for
 * construct plots, tables allow to filter current visualization of the graph.
 * @type {Array}
 */
let listGiFilter = []

let reloadAccessionList = []

// variable to store previous list of accessions that iterate through table
// is the same or not
let previousTableList = []

let sliderMinMax = [] // initiates an array for min and max slider entries
// and stores it for reloading instances of onload()
let listGi = []
// define render on the scope of onload in order to be used by buttons
// outside renderGraph
let renderer

// variable used to control if div is shown or not
let multiSelectOverlay = false
// store the node with more links
let storeMasterNode = []    //cleared every instance of onload
// start array that controls taxa filters
const idsArrays = ["p_Order", "p_Family", "p_Genus", "p_Species"]

let counter = -1 //sets a counter for the loop between the inputs nodes
// Sets parameters to be passed to WebglCircle in order to change
// node shape, setting color and size.
const nodeColor = 0x666370 // hex rrggbb
const minNodeSize = 4 // a value that assures that the node is
// displayed without increasing the size of big nodes too much

let list = []   // list to store references already ploted as nodes
// links between accession numbers
let listLengths = [] // list to store the lengths of all nodes

let getLinkedNodes = false // a boolean variable to control the Re_run behavior

/**
 * Variable that controls the behavior of shift key through refreshButton
 * click.
 * type {Boolean}
 */
let freezeShift = true

let slider

let xRangePlotList = []

/**
 * Variable that controls the type of input being provided
 * @type {boolean|String} - By default this variable is false but when files are
 * imported this will change to a string that corresponds to the type of file
 * being imported. This behavior is set when the file import modal is dismissed
 */
let fileMode = false
