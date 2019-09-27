// TODO Search for header names instead of assuming the column indexes
var COLUMN_FIRST_NAME = 10;
var COLUMN_LAST_NAME = 11;
var COLUMN_PREFERENCE_1 = 1;
var COLUMN_PREFERENCE_2 = 2;
var COLUMN_PREFERENCE_3 = 3;

var OUTPUT_SHEET_ID = "13K10UA0ZNjCDGTbVbO104CdW97DJgm3MaK2TZpiRytw";

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
    for (var i = 1; i < data.length; i++){
        //Logger.log('First name: ' + data[i][COLUMN_FIRST_NAME]);
        //Logger.log('Last name: ' + data[i][COLUMN_LAST_NAME]);
        //Logger.log('Workshop A: ' + data[i][COLUMN_PREFERENCE_1]);
        //Logger.log('Workshop B: ' + data[i][COLUMN_PREFERENCE_2]);
        //Logger.log('Workshop C: ' + data[i][COLUMN_PREFERENCE_3]);
        var firstName = data[i][COLUMN_FIRST_NAME];
        var lastName = data[i][COLUMN_LAST_NAME];
        var preference_1 = data[i][COLUMN_PREFERENCE_1];
        var preference_2 = data[i][COLUMN_PREFERENCE_2];
        var preference_3 = data[i][COLUMN_PREFERENCE_3];
        outputSheet.appendRow([firstName, lastName, preference_1, preference_2, preference_3]);
    }
}
