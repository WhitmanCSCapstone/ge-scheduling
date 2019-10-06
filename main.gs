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
    for (var i = 1; i < responseData.length; i++){
        var firstName = responseData[i][COLUMN_FIRST_NAME];
        var lastName = responseData[i][COLUMN_LAST_NAME];
        var preference_1 = responseData[i][COLUMN_PREFERENCE_1];
        var preference_2 = responseData[i][COLUMN_PREFERENCE_2];
        var preference_3 = responseData[i][COLUMN_PREFERENCE_3];
        outputSheet.appendRow([firstName, lastName, preference_1, preference_2, preference_3]);
    }
}

function scorer(){
    var score = 0;
    var responseSheet = SpreadsheetApp.getActiveSheet();
    var responseData = responseSheet.getDataRange().getValues();
    
    var outputSheet = SpreadsheetApp.openById(OUTPUT_SHEET_ID);
    var outputData = outputSheet.getDataRange().getValues();

    for (var i = 1; i < responseData.length; i++){
        if((outputData[i][2] == responseData[i][COLUMN_PREFERENCE_1])
            || (outputData[i][3] == responseData[i][COLUMN_PREFERENCE_1])
            || (outputData[i][4] == responseData[i][COLUMN_PREFERENCE_1])){
            score += 1;
        }
        if((outputData[i][2] == responseData[i][COLUMN_PREFERENCE_2])
            || (outputData[i][3] == responseData[i][COLUMN_PREFERENCE_2])
            || (outputData[i][4] == responseData[i][COLUMN_PREFERENCE_2])){
            score += 3;
        }
        if((outputData[i][2] == responseData[i][COLUMN_PREFERENCE_3])
            || (outputData[i][3] == responseData[i][COLUMN_PREFERENCE_3])
            || (outputData[i][4] == responseData[i][COLUMN_PREFERENCE_3])){
            score += 5;
        }
        if((outputData[i][2] == responseData[i][COLUMN_PREFERENCE_4])
            || (outputData[i][3] == responseData[i][COLUMN_PREFERENCE_4])
            || (outputData[i][4] == responseData[i][COLUMN_PREFERENCE_4])){
            score += 10;
        }if((outputData[i][2] == responseData[i][COLUMN_PREFERENCE_5])
            || (outputData[i][3] == responseData[i][COLUMN_PREFERENCE_5])
            || (outputData[i][4] == responseData[i][COLUMN_PREFERENCE_5])){
            score += 11;
        }if((outputData[i][2] == responseData[i][COLUMN_PREFERENCE_6])
            || (outputData[i][3] == responseData[i][COLUMN_PREFERENCE_6])
            || (outputData[i][4] == responseData[i][COLUMN_PREFERENCE_6])){
            score += 12;
        }
    }
    Logger.log('Score: ' + score)
}