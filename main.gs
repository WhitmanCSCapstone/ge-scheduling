// TODO Search for header names instead of assuming the column indexes
const COLUMN_FIRST_NAME = 10;
const COLUMN_LAST_NAME = 11;
const COLUMN_PREFERENCE_1 = 1;
const COLUMN_PREFERENCE_2 = 2;
const COLUMN_PREFERENCE_3 = 3;

const OUTPUT_SHEET_ID = "13K10UA0ZNjCDGTbVbO104CdW97DJgm3MaK2TZpiRytw";

/**
Automatically runs when sheet is opened.
*/
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Great Explorations')
        .addItem('Match Girls to Workshops', 'matchGirls')
        .addToUi();
}

function matchGirls() {
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();

    var outputSheet = SpreadsheetApp.openById(OUTPUT_SHEET_ID);
    outputSheet.appendRow(['Cell A1', 5]);
    outputSheet.appendRow(['Cell A2', 9]);
    //for (var i = 1; i < data.length; i++){
        //Logger.log('First name: ' + data[i][COLUMN_FIRST_NAME]);
        //Logger.log('Last name: ' + data[i][COLUMN_LAST_NAME]);
        //Logger.log('Workshop A: ' + data[i][COLUMN_PREFERENCE_1]);
        //Logger.log('Workshop B: ' + data[i][COLUMN_PREFERENCE_2]);
        //Logger.log('Workshop C: ' + data[i][COLUMN_PREFERENCE_3]);
        
    //}
}
