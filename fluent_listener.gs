//
// fluent_listerner.gs: receives fluentd event log via https and generate a sheet with a chart
//

// CONSTS
MAX_ROWS_LARGE = 300; // for AREA, LINE, SCATTER and TABLE
MAX_ROWS_SMALL = 30;  // for BAR and COLUMN
DEFAULT_SHEET_NAME = "logs"; // sheet name used when tag isn't specified
START_ROW = 1;

// receiving posts from fluentd
function doPost(e){
  
  // for testing
  if (!e) {
    e = {"parameter": {"value1" : Math.random() * 10, "value2" : Math.random() * 10, "value3" : Math.random() * 10, "tag" : "test6_LINE"}};
  }

  // extract fluentd tag
  var tag = "";
  if (e.parameter.tag) {
    tag = e.parameter.tag;
    delete e.parameter.tag;
  }
  
  // extract timestamp (use local timestamp if not available)
  var timestamp = new Date();
  if (e.parameter.timestamp) {
    timestamp = new Date(Number(e.parameter.timestamp) * 1000);
    delete e.parameter.timestamp;
  }

  // get or insert sheet
  var props = Object.getOwnPropertyNames(e.parameter).sort();
  var sheet = getOrInsertSheetByTag(tag, props.length + 1);

  // add new row and delete the last row
  sheet.insertRows(START_ROW + 1);
  sheet.deleteRow(sheet.getMaxRows());
  
  // set timestamp
  sheet.getRange(START_ROW + 1, 1).setValue(timestamp);
  
  // insert new values
  for (i = 0; i < props.length; i++) {
    sheet.getRange(START_ROW, i + 2).setValue(props[i]);
    sheet.getRange(START_ROW + 1, i + 2).setValue(e.parameter[props[i]]);
  }
}

// get or insert sheet
function getOrInsertSheetByTag(tag, colSize) {
  
  // determine sheet name from the tag name
  if (tag == "") {
    tag = DEFAULT_SHEET_NAME;
  }
  var tableSheetName = tag;
  
  // determine chart properties from the tag suffixes
  var chartSheetName = null;
  var chartType = null;
  var startColumn = 1;
  var rowSize = MAX_ROWS_LARGE;
  var isStacked = false;
  var matched = tag.match(/(.*)_(AREA|BAR|COLUMN|LINE|SCATTER|TABLE)(_STACKED)?/);
  if (matched) {
    tableSheetName = matched[1];
    chartSheetName = tag;
    isStacked = matched[3] != null;
    if (matched[2] == "AREA") {
      chartType = Charts.ChartType.AREA;
    } else if (matched[2] == "BAR") {
      chartType = Charts.ChartType.BAR;
      rowSize = MAX_ROWS_SMALL;
    } else if (matched[2] == "COLUMN") {
      chartType = Charts.ChartType.COLUMN;
      rowSize = MAX_ROWS_SMALL;
    } else if (matched[2] == "LINE") {
      chartType = Charts.ChartType.LINE;
    } else if (matched[2] == "SCATTER") {
      chartType = Charts.ChartType.SCATTER;
    } else if (matched[2] == "TABLE") {
      chartType = Charts.ChartType.TABLE;
    }
  }
  
  // check if there's existing table sheet
  var sheets = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.setActiveSpreadsheet(sheets);
  var tableSheet = sheets.getSheetByName(tableSheetName);
  if (tableSheet) {
    return tableSheet;
  }
  
  // insert new sheet for table
  tableSheet = sheets.insertSheet(tableSheetName);
  tableSheet.insertRows(START_ROW, rowSize + 1);
  if (tableSheet.getMaxRows() > rowSize + 1) {
    tableSheet.deleteRows(rowSize + 1, tableSheet.getMaxRows() - rowSize - 1);
  }
  tableSheet.getRange(START_ROW, 1).setValue("timestamp");
  
  // insert new sheet for chart
  if (chartSheetName) {
    var chartSheet = sheets.insertSheet(chartSheetName);
    var chart = chartSheet.newChart()
    .setChartType(chartType)
    .addRange(tableSheet.getRange(1, startColumn, rowSize + 1, colSize))
    .setPosition(1, 1, 0, 0)
    .setOption("width", 1300)
    .setOption("height", 600)
    .setOption("isStacked", isStacked)
    .setOption("title", tableSheetName)
    .build();
    chartSheet.insertChart(chart);
    sheets.setActiveSheet(chartSheet);
  } else {
    sheets.setActiveSheet(tableSheet);
  }
  return tableSheet;
}

