function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Great Explorations')
      .addItem('Match Girls to Workshops', 'matchGirls')
      .addToUi();
}