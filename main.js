/*globals SpreadsheetApp, Logger, Matcher, workshopInputChecker,
 * studentInputChecker, preferenceInputChecker */

var COLUMN_FIRST_NAME = 10;
var COLUMN_LAST_NAME = 11;
var COLUMN_GRADE = 17;

// Column indicies of workshop info for the workshop class
var COLUMN_WORKSHOP_NAME = 2;
var COLUMN_WORKSHOP_CAPACITY = 6;
var COLUMN_WORKSHOP_BUILDING = 4;
var COLUMN_WORKSHOP_ROOM = 5;


//Column indicies for the Data Sheet

var COLUMN_WORKSHOP_NUMBER = 1;
var COLUMN_SLOTS_TAKEN = 2;
var COLUMN_TOTAL_SLOTS = 3;

// Column indices of student preferences in order from most preferred to least
var PREFERENCE_COLUMNS = [1, 2, 3, 4, 5, 6];

// Column indices of student enrollments in order of session time
var ENROLLED = [2, 3, 4];

var HEADERS = [
    "First name",
    "Last name",
    "Grade",
    "Workshop #",
    "Workshop Section A",
    "Workshop Location",
    "Workshop #",
    "Workshop Section B",
    "Workshop Location",
    "Workshop #",
    "Workshop Section C",
    "Workshop Location"
];

var DATA_SHEET_HEADER1 =[
    "Workshop Name",
    "WorkShop Number",
    "Slots taken",
    "Total Slots",
    "Does this work?"
    

];


var DATA_SHEET_HEADER2 = [
    "# of First Preferences",
    "# of Second Preferences",
    "# of Third Preferences",
    "# of Fourth Preferences",
    "# of Fifth Preferences",
    "# of Sixth Preferences",
    "# of Not Preferenced"
  
  
  ]

//VARIABLES FOR RESPONSE SPREADSHEET INDICES
var RESPONSE_SHEET_INDEX = 0;
var OUTPUT_SHEET_INDEX = 1;
var PREASSIGNMENT_SHEET_INDEX = 2;
var DATA_SHEET_INDEX = 3;

// Formattin workshop variables
var WORKSHOP_SPREADSHEET_ID = "1pZQWPV532JLWQuDLYiw4CdcvvBn8zoRQZ8lX2aaDzRc";

var RESPONSE_SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// Response Data
var RESPONSE_SHEET = RESPONSE_SPREADSHEET.getSheets()[RESPONSE_SHEET_INDEX];
var responseData = RESPONSE_SHEET.getDataRange().getValues();

// Workshop Sheet
var WORKSHOP_SHEET = SpreadsheetApp.openById(WORKSHOP_SPREADSHEET_ID);
var workshopData = WORKSHOP_SHEET.getDataRange().getValues();

// Output Sheet
var outputSheet = RESPONSE_SPREADSHEET.getSheets()[OUTPUT_SHEET_INDEX];

//Pre-Assignment Sheet
var preAssignmentSheet = RESPONSE_SPREADSHEET.getSheets()[
    PREASSIGNMENT_SHEET_INDEX
];
var preAssignmentData = preAssignmentSheet.getDataRange().getValues();


//Assignment Data Sheet
var dataSheet = RESPONSE_SPREADSHEET.getSheets()[DATA_SHEET_INDEX];


/**
 * Automatically runs when sheet is opened.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu("Great Explorations")
        .addItem("Match Girls to Workshops", "main")
        .addToUi();
}

/**
 * It's the main function, what more do you need to know.
 */
function main() {
    var matcher = new Matcher();

    for (var i = 1; i < workshopData.length; i++) {
        // for all workshops i
        var name = workshopData[i][COLUMN_WORKSHOP_NAME];
        var number = i;
        var capacity = workshopData[i][COLUMN_WORKSHOP_CAPACITY];
        var location =
            workshopData[i][COLUMN_WORKSHOP_BUILDING] +
            " " +
            workshopData[i][COLUMN_WORKSHOP_ROOM];

        workshopInputChecker(name, capacity, location, i);

        matcher.addNewWorkshop(name, number, capacity, location);
    }

    for (var j = 1; j < responseData.length; j++) {
        // for all students j
        var firstName = responseData[j][COLUMN_FIRST_NAME];
        var lastName = responseData[j][COLUMN_LAST_NAME];
        var grade = responseData[j][COLUMN_GRADE];
        studentInputChecker(firstName, lastName, grade, j);

        var preferenceNums = [];

        for (var k = 0; k < PREFERENCE_COLUMNS.length; k++) {
            // for all student preferences k
            var preferredWorkshop = responseData[j][PREFERENCE_COLUMNS[k]];
            var workshopNum = parseInt(
                preferredWorkshop.slice(
                    preferredWorkshop.indexOf("(") + 1,
                    preferredWorkshop.indexOf(")")
                )
            );
            preferenceInputChecker(workshopNum, j, k);

            if (preferenceNums.indexOf(workshopNum) === -1) {
                preferenceNums.push(workshopNum);
            }
        }
        matcher.addNewStudent(firstName, lastName, preferenceNums, grade);
    }

    Logger.log(matcher.allStudents[0].firstName);
    Logger.log(matcher.allStudents[0].preferences[0].name);

    populateSheet(outputSheet, dataSheet, matcher);
}

/**
 * Output the results of the matcher to the given sheet.
 */
/**
 * Output the results of the matcher to the given sheet.
 */
function populateSheet(outputSheet, dataSheet, matcher) {
  
  
  
    //Formats the sheets before writing to them.
    outputSheet.clear();
    outputSheet.appendRow(OUTPUT_SHEET_HEADERS);
    dataSheet.clear();
    dataSheet.appendRow(DATA_SHEET_HEADER1);
  

  
    matcher.fixStudentPreferences();
    matcher.matchGirls();
  
  
    var results = [0,0,0,0,0,0,0]
  

    for (var i = 0; i < matcher.allStudents.length; i++) {
        var student = matcher.allStudents[i];
        var prefnums = student.checkPreferenceNumbers()
        Logger.log(prefnums);
      //For loop records the the number of times a student has # preference in his preference list
      for(var z = 0; z < prefnums.length; z++){
      results[prefnums[z]] = results[prefnums[z]] +1; 
      }
   
      
      
        var studentLine = [];
        studentLine.push(student.firstName);
        studentLine.push(student.lastName);
        studentLine.push(student.grade);

        // List the student's assigned workshops in the row
        for (var j = 0; j < student.assignedWorkshops.length; j++) {
            var assignedWorkshop = student.assignedWorkshops[j];
            studentLine.push(assignedWorkshop.number);
            studentLine.push(assignedWorkshop.name);
            studentLine.push(assignedWorkshop.location);
            //studentLine.push(workshop.toString());
            //Logger.log(studentLine);
        }

        outputSheet.appendRow(studentLine);
    }
  
  for (var k = 0; k < matcher.workshopsByPopularity.length; k++) {
    
    Logger.log(matcher.workshopsByPopularity.length);
    var dataInfo = [];
    var workshopData = matcher.workshopsByPopularity[k];

    dataInfo.push(workshopData.name);
    dataInfo.push(workshopData.number);
    dataInfo.push(workshopData.slotsFilled);
    dataInfo.push(workshopData.totalBaseCapacity);
    dataSheet.appendRow(dataInfo);
    
    
  }
  
   dataSheet.appendRow(DATA_SHEET_HEADER2);
   dataSheet.appendRow(results);
    
        
}

       
