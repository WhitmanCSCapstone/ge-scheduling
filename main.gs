/**
Automatically runs when sheet is opened.
*/
function onOpen() {
    SpreadsheetApp.getUi()
      .createMenu('Great Explorations')
      .addItem('Match Girls to Workshops', 'matchGirls')
      .addToUi();
}
//HELLO WORLD