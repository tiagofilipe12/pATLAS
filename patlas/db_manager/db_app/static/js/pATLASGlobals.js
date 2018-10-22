/**
 * A bunch of global functions to be used throughout patlas
 */

/**
 * The variable in which the version is stored. This variable will be used to
 * check the version of the imported files and projects.
 */
const version = "1.6.0"

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

// helps set left side menu to close status
let firstClickMenu = true

// checks if vivagraph should load first initial dataset or the filters
let firstInstace = true
// variable to check if page was reloaded
let pageReload = false
// variable to check if page was rerun for pffamilies and resistance
// filtering to work properly
let pageReRun = false

/**
 * Variable that checks if resistance button tab in right side popup menu has
 * already been
 * clicked or not. This prevents the frontend from making unnecessary requests
 * to the backend if the same plasmid popup is selected since the previous click
 * on this tab
 * @type {boolean}
 */

let clickedPopupButtonCard = false
/**
 * Variable that checks if plasmidfinder button tab in right side popup menu
 * has already been
 * clicked or not. This prevents the frontend from making unnecessary requests
 * to the backend if the same plasmid popup is selected since the previous click
 * on this tab
 * @type {boolean}
 */

let clickedPopupButtonFamily = false
/**
 * Variable that checks if virulence button tab in right side popup menu has
 * already been
 * clicked or not. This prevents the frontend from making unnecessary requests
 * to the backend if the same plasmid popup is selected since the previous click
 * on this tab
 * @type {boolean}
 */
let clickedPopupButtonVir = false

// variable to control stats displayer
/**
 * Variable to control if selections made with shift click are made or not.
 * If false it means that no selections were made using shift key plus mouse
 * dragging and if true it means that a selection has been made using shift key.
 *
 * @type {boolean}
 */
let areaSelection = false

/**
 * an array to store bootstrap table related list for downloads and coloring
 * nodes on submit
 * @type {Array}
 */
let bootstrapTableList = []

/**
 * Variable that stores the node being currently clicked and used for the right
 * side popup. When false it means that no plasmid is being queried and the
 * right side popup should be closed, but if different from false should store
 * the accession number of the currently selected plasmid.
 * @type {boolean|String}
 */
let currentQueryNode = false

/**
 * Variable that is used to store the files and the data to generate the heatmap
 * when importing multiple file at once.
 * @type {Array}
 */
let masterReadArray = []

/**
 * Variable that will store the imported samples whenever they are available,
 * otherwise it will be set to false. This variable is used for mapping results
 * but it may be used to set access to objects defined in mashJson and
 * assemblyJson since it will be in fact used as the main object to set
 * selections throughout pATLAS every time a file is imported. So, this is
 * really important!
 * @type {boolean|Object}
 */
let readFilejson = false

/**
 * Variable that will store the imports from mash screen.
 * @type {boolean|Object}
 */
let mashJson = false

/**
 * Variable that will store the imports from mash dist.
 * @type {boolean|Object}
 */
let assemblyJson = false

/**
 * Variable that will store the imports from consensus files.
 * @type {boolean|Object}
 */
let consensusJson = false

/**
 * Variable that will store the imports from project files.
 * @type {boolean|Object}
 */
let projectJson = false

/**
 * Variable that allows to select one node from highcharts graphs.
 * @type {boolean}
 */
let clickedHighchart = false

/**
 * variable that stores the number of nodes a graph has.
 */
let graphSize

/**
 * A variable that stores the total number of links
 */
// let totalNumberOfLinks

/**
 * variable that stores the multi selection overlay object
 * type {boolean|Object}
 */
let multiSelectOverlayObj = false

/**
 * Variable to check if legend is defined or not and if so display it in the
 */
let legendInst

/**
 * object that lets collect plot data and that enable to click on bars and
 * retrieve selected nodes in vivagraph (highlighting them)
 * @type {Object}
 */
let associativeObj = {}

/**
 * Global that controls the type of plot that will be displayed depending on the
 * buttons that are clicked. For instance if species button is clicked it will
 * be set to "species".
 */
let clickerButton

/**
 * List of accession numbers that will be used to construct a given plot
 */
let listPlots

/**
 * Creates a temporary store for the results from requestDB function in which
 * the first element will have listGiFilter (the list of accession numbers that
 * will selected) and as the second element reloadAccessionList (a list that
 * stores all the nodes that are in the current view, including those that are
 * not selected with colors). This array will only have two entries or it will
 * be undefined as the default state.
 * @type {Array}
 */
let requestDBList

// legend slider controller vars
/**
 * Array that contains a list of the legend slider buttons that allow to cycle
 * the legend from one type of selection to another, for instance it allows to
 * change the legend color scheme from taxa selections to resistances, without
 * having to make a new seletion each time the user wants to see a different
 * selection.
 * @type {Array}
 */
let legendSliderControler = [
  "#taxaModalSubmit",
  "#resSubmit",
  "#pfSubmit",
  "#virSubmit"
]

/**
 * Variable that searches for the
 * @type {String|boolean}
 */
let selectedFilter = false

/**
 * Alongside with legendSliderControler array this var will allow to cycle
 * the legend.
 * @type {number}
 */
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

/**
 * List used to control if the plots have already been displayed for that list
 * @type {Array}
 */
let reloadAccessionList = []

/**
 * variable to store previous list of accessions that iterate through table
 * is the same or not
 * @type {Array}
 */
let previousTableList = []

/**
 * initiates an array for min and max slider entries and stores it for
 * reloading instances of onload()
 * @type {Array}
 */
let sliderMinMax = []

/**
 * This list of all nodes available in default visualization, therefore all
 * accession numbers of plasmids available in patlas.
 * @type {Array}
 */
let listGi = []

/**
 * defines render on the scope of onload in order to be used by buttons outside
 * renderGraph
 */
let renderer

/**
 * variable used to control if div is shown or not
 * @type {boolean}
 */
let multiSelectOverlay = false

/**
 * store the node with more links. This variable is cleared every instance of
 * onload. This array contains two entries, the first is the accession number
 * of the central node and the second is the total number of links of that
 * accession number in patlas. The idea is that the node with more links is
 * the storeMasterNode and the central node of the current visualization
 * @type {Array}
 */
let storeMasterNode = []

/**
 * Variable that will store the central node in which the dom can be centered
 * @type {boolean|String}
 */
let centralNode = false

/**
 * sets a counter for the loop between the inputs nodes.
 * @type {number}
 */
let counter = -1

// Sets parameters to be passed to WebglCircle in order to change
// node shape, setting color and size.
/**
 * Sets parameters to be passed to WebglCircle in order to change node shape,
 * setting color and size. colors follow the following enconde: '0x' + hex code
 * (rrggbb)
 * @type {number}
 */
const nodeColor = 0x666370

/**
 *  a value that assures that the node is displayed without increasing the
 *  size of big nodes too much
 * @type {number}
 */
const minNodeSize = 4

/**
 * list to store references already plotted as nodes links between accession
 * numbers
 * @type {Array}
 */
let list = []

/**
 * list to store the lengths of all nodes
 * @type {Array}
 */
let listLengths = []

/**
 * a boolean variable to control the Re_run behavior
 * @type {boolean}
 */
let getLinkedNodes = false

/**
 * Variable that controls the behavior of shift key through refreshButton
 * click.
 * type {Boolean}
 */
let freezeShift = true

/**
 * Variable to store the length slider element id. This will then be used by
 * nodeUISlider module
 */
let slider

/**
 * The array that will be used to populate the xrange plot data
 * @type {Array}
 */
let xRangePlotList = []

/**
 * Variable that controls the type of input being provided
 * @type {boolean|String} - By default this variable is false but when files are
 * imported this will change to a string that corresponds to the type of file
 * being imported. This behavior is set when the file import modal is dismissed
 */
let fileMode = false

/**
 * Variable that stores the current selected sample.
 * @type {boolean|String}
 */
let currentSample = false

/**
 * The last position of the mouse that is used to drag multiple nodes at once
 * by using shift + x function to drag multiple nodes
 * @type {boolean}
 */
let lastPosition = false

/**
 * Variable used to check if dragging is active and once mouse is released
 * it will be set to false again
 * @type {boolean}
 */
let dragging = false

/**
 * Variable to prevent filter modal from appearing. if blockFilterModal is
 * false then show modal that allows to show buttons to filter or not the
 * current selection
 * @type {boolean}
 */
let blockFilterModal = false
