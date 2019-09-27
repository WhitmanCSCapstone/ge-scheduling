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
    var sheet = SpreadsheetpApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    for (var i - 0, i < data.length; i++){
        Logger.log('First name: ' + data[i][10]);
        Logger.log('Last name: ' + data[i][11]);
        Logger.log('Workshop A: ' + data[i][1]);
        Logger.log('Workshop B: ' + data[i][2]);
        Logger.log('Workshop C: ' + data[i][3]);
    }
}
