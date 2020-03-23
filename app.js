//Version 0.1
// User Editable
var warcraftLogsAPIKey = "ENTER YOUR API KEY HERE";

//Usage: Google Sheets
// =TRANSPOSE(warcraftLogInfo(character, server, region, encounter, $A$1))

// Do not edit below this line if your just looking to use this.
//This is a very rough first DataTransferItem, currently only supports BWL but I will be adding MC support very soon.
var raid = [];
var best = -1;
var avg = -1;
var runs = [];

// Do not edit past here
var raidData = function(character, server, region, encounter) {

        //Remove White Space
        this.character = character.replace(/\s/g, "");
        this.server = server.replace(/[\u200B-\u200D\uFEFF]/g, "");     

        //Make Region Lowercase
        this.region = region.toLowerCase();
      
        //Make Encounter Name Lower Case
        this.encounter = encounter.toLowerCase();
 
      
        //Fail Checks
        if (this.character == "" || this.server == "") {
            return " ";
        }

  Utilities.sleep(Math.floor((Math.random() * 28000) + 1000));
  
        this.bwl_template = [
          { id: 610, best: -1, avg: -1, runs: [] },
          { id: 611, best: -1, avg: -1, runs: [] },
          { id: 612, best: -1, avg: -1, runs: [] },
          { id: 613, best: -1, avg: -1, runs: [] },
          { id: 614, best: -1, avg: -1, runs: [] },
          { id: 615, best: -1, avg: -1, runs: [] },
          { id: 616, best: -1, avg: -1, runs: [] },
          { id: 617, best: -1, avg: -1, runs: [] }
        ]
        
        this.mc_template = []
        
        this.eid = -1;
        this.classname = 'NA'
        this.spec = 'NA'

        switch (this.encounter) {
            case "blackwing lair":
                raid = this.bwl_template;
                this.eid = 1002
                break;
        }
      
      
        // HTTP Data Pull
        var options = {
            muteHttpExceptions: true
        };

        this.logs = "";

        //Pull the Parses
        this.charLogs = UrlFetchApp.fetch("https://classic.warcraftlogs.com/v1/parses/character/" + this.character + "/" + this.server + "/" + this.region + "?metric=dps&timeframe=historical&api_key=" + warcraftLogsAPIKey + "", options);
        this.logs = JSON.parse(this.charLogs.toString());

        
    
    this.processLogs = function(){
        this.classname = this.logs[0].class;

        this.logs.forEach(function(element){
            //Check for Encounter ID
          var x  = this.raid.findIndex(o => o.id === 612);
          
          var encounterIndex = this.raid.findIndex(o => o.id === element.encounterID);

            //Updated Best if it's been beaten but current attempt
            if (element.percentile > this.raid[encounterIndex].best) {
                this.raid[encounterIndex].best = element.percentile
            }

            //Add this to list of runs
            this.raid[encounterIndex].runs.push(element.percentile)
        });

        //Calculate Encounter Averages
        raid.forEach(encounter => {
            encounter.avg = encounter.runs.reduce((a, b) => a + b) / encounter.runs.length
            if (best < encounter.avg) best = encounter.avg;
            runs.push(encounter.avg);
        })

        //Calculate Raid AVG
        avg = runs.reduce((a, b) => a + b) / runs.length;
    }

    this.sheetData = function(){
        let googleDocsData = [this.classname, best.toFixed(2), avg.toFixed(2)];
        raid.forEach(encounter => {
            googleDocsData.push(encounter.best.toFixed(2), encounter.avg.toFixed(2));
        })

        return googleDocsData;
    }
    
    this.processLogs()
}


function warcraftLogInfo(charName, serverName, globalRegion, encounterName) {
  if(charName === "" || serverName === "" || encounterName === "") {
    return " ";
  } 
  
  var char = new raidData(charName, serverName, globalRegion, encounterName);
  return char.sheetData()
  

}


//Refresh Button
function onOpen() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var entries = [{
        name: "Click to Refresh",
        functionName: "refreshLogs"
    }];
    sheet.addMenu("\u21BB  Refresh all Characters", entries);
};

function refreshLogs() {
    SpreadsheetApp.getActiveSpreadsheet().getRange('A1').setValue(Math.random());
}