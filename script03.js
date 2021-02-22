// JavaScript source code
//GET https://statsapi.web.nhl.com/api/v1/teams

document.getElementById("button01").addEventListener("click", getInfo);


function loadDoc(url, cFunction, passVar) { //do xhttp request with a link and function
    var xhttp = new XMLHttpRequest();
    //var result = -1;
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            cFunction(this, passVar); //call function with response as parameter
            
        }
    };
    xhttp.send();
    //if (result != -1) {
    //}
    //return result;
}

function getInfo() {
    var link = "https://statsapi.web.nhl.com/api/v1/schedule?teamId=16&season=20202021";
    loadDoc(link, chicagoSchedule);
}

function chicagoSchedule(xhttp) {
    var response = JSON.parse(xhttp.responseText);
    var seasonDates = Number(response.totalGames);//references dates that they have games
    var dates = response.dates;
    var html = "<table id=schedule> <tbody id=scheduleBody></tbody></table>";
    document.getElementById("display").innerHTML = html;
    scheduleInfo(dates, seasonDates);
    return -1;
}

function scheduleInfo(dates, seasonDates) {
    var html = "";
    for (var i = 0; i < seasonDates; i++) { //loop through dates in season
        var insertHTML = "";
        date = dates[i];
        var numGames = date.totalGames;
        for (var j = 0; j < numGames; j++) { //loop through games on the date incase there's ever a douhbleheader
            var gameID = date.games[j].gamePk;
            var awayID = date.games[j].teams.away.team.id;
            var awayAbbr = getAbbr(awayID);
            var awayScore = date.games[j].teams.away.score;
            var homeID = date.games[j].teams.home.team.id;
            var homeAbbr = getAbbr(homeID);
            var homeScore = date.games[j].teams.home.score;
            insertHTML += "<tr id=" + gameID + "><td class='team" + awayID + " away team' >" + awayAbbr + "</td>";
            insertHTML += "<td class='away score'>" + awayScore + "</td>";
            insertHTML += "<td class='team" + homeID + " home team'>" + homeAbbr + "</td>";
            insertHTML += "<td class='home score'>" + homeScore + "</td></tr>";
            
            insertHTML = findWinner(insertHTML, gameID, awayID, awayScore, homeID, homeScore);
            var awaylink = makeTeamLink(awayID);
            var homelink = makeTeamLink(homeID);
            //var result = loadDoc(awaylink, teamAbbr, insertHTML);//currently this populates whole table each loop iteration
            //loadDoc(homelink, teamAbbr, homeID);//may want to change how you populate team abbreviations and just do it once for whole table at end
            //html += result;
        }
        html += insertHTML;
    }
    //document.getElementById("scheduleBody").innerText = html;
    document.getElementById("scheduleBody").innerHTML = html;
}

function getGameID(xhttp) { //need gameID to get the correct link for last Chicago game
    var response = JSON.parse(xhttp.responseText)
    var gameID = response.teams[0].previousGameSchedule.dates[0].games[0].gamePk; //get gameID
    var link = makeGameLink(gameID); //get new link
    var result = loadDoc(link, getLineScore); //callback function to get the score
    return -1;
}

function getLineScore(xhttp) {
    var response = JSON.parse(xhttp.responseText)

    homeTeam = response.teams.home.team.name;
    hGP1 = response.periods[0].home.goals;
    hGP2 = response.periods[1].home.goals;
    hGP3 = response.periods[2].home.goals;
    hGPF = response.teams.home.goals;

    awayTeam = response.teams.away.team.name;
    aGP1 = response.periods[0].away.goals;
    aGP2 = response.periods[1].away.goals;
    aGP3 = response.periods[2].away.goals;
    aGPF = response.teams.away.goals;

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var rawDate = response.periods[0].startTime;
    var msec = Date.parse(rawDate);
    var d = new Date(msec);
    var rawMonth = d.getMonth();
    var month = months[rawMonth];
    var day = d.getDate();

    document.getElementById("date").innerHTML = month + " " + day;
    document.getElementById("homeTeamName").innerHTML = homeTeam;
    document.getElementById("hGP1").innerHTML = hGP1;
    document.getElementById("hGP2").innerHTML = hGP2;
    document.getElementById("hGP3").innerHTML = hGP3;
    document.getElementById("hGPF").innerHTML = hGPF;

    document.getElementById("awayTeamName").innerHTML = awayTeam;
    document.getElementById("aGP1").innerHTML = aGP1;
    document.getElementById("aGP2").innerHTML = aGP2;
    document.getElementById("aGP3").innerHTML = aGP3;
    document.getElementById("aGPF").innerHTML = aGPF;
    return -1;
}

function makeGameLink(gameID) { //makes link with gameID to get stats
    var link = "https://statsapi.web.nhl.com/api/v1/game/" + gameID + "/linescore";
    return link;
}

function makeTeamLink(teamID) {
    var link = "https://statsapi.web.nhl.com/api/v1/teams/" + teamID;
    return link;
}


function showLineScore() { //this function uses callback function loadDoc to do xhttp request
    loadDoc("https://statsapi.web.nhl.com/api/v1/teams/16?expand=team.schedule.previous", getGameID);
}



function teamAbbr(xhttp, insertHTML) {
    var response = JSON.parse(xhttp.responseText);
    var abbr = response.teams[0].abbreviation;
    var teamID = response.teams[0].id;
    var arr = insertHTML.split("</td>");
    arr[0] += abbr + "</td>";
    //document.getElementById("display").innerText = arr[0];
    return "hello";
}
function findAbbr(text, awayID, homeID) {
    var awaylink = makeTeamLink(awayID);
    var homelink = makeTeamLink(homeID);
    
}

function findWinner(text, gameID, awayID, awayScore, homeID, homeScore) {
    //var game = document.getElementByID(gameID);
    if (awayScore > homeScore) {
        var arr = text.split("away team");
        arr[0] += "away team winner";
        var subArr = arr[1].split("away score");
        subArr[0] += "away score winner";
        arr[1] = subArr[0] + subArr[1];
        //document.getElementById("display").innerText = arr[1];
    //document.getElementById("display").innerHTML = game.getElementsByClassName("away")[0].classList;
    }
    else {
        var arr = text.split("home team");
        arr[0] += "home team winner";
        var subArr = arr[1].split("home score");
        subArr[0] += "home score winner";
        arr[1] = subArr[0] + subArr[1];
        //document.getElementById("display").innerText = arr1[0] + arr1[1];
    }
    text = arr[0] + arr[1];
    return text;
}

function getAbbr(teamID) {
    var allAbbr = [
        "NJD",
        "NYI",
        "NYR",
        "PHI",
        "PIT",
        "BOS",
        "BUF",
        "MTL",
        "OTT",
        "TOR",
        "ATL", //not even a team anymore lol
        "CAR",
        "FLA",
        "TBL",
        "WSH",
        "CHI",
        "DET",
        "NSH",
        "STL",
        "CGY",
        "COL",
        "EDM",
        "VAN",
        "ANA",
        "DAL",
        "LAK",
        "PHX", //not a team anymore
        "SJS",
        "CBJ",
        "MIN",
        "MNS", //old teams \/\/\/
        "QUE",
        "WIN",
        "HFD",
        "CLR",
        "SEN",
        "HAM",
        "PIR",
        "QUA",
        "DCG",
        "MWN",
        "QBD",
        "MMR",
        "NYA",
        "SLE",
        "OAK",
        "AFM",
        "KCS",
        "CLE",
        "DFL",
        "BRK", //old teams^^^
        "WPG", //real teams
        "ARI",
        "VGK",
        "SEA", //real teams
        "CGS", //old teams
        "TAN",
        "TSP"
    ]
    //this is a bad solution to this problem
    teamID += -1;
    return allAbbr[teamID];
}