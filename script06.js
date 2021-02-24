// JavaScript source code
//GET https://statsapi.web.nhl.com/api/v1/teams


function loadDoc(url, cFunction, passVar) { //do xhttp request with a link and function
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            cFunction(this, passVar); //call function with response as parameter
            
        }
    };
    xhttp.send();
}

function getInfo() {
    var link = "https://statsapi.web.nhl.com/api/v1/schedule?teamId=16&season=20202021";
    loadDoc(link, chicagoSchedule);
}

function chicagoSchedule(xhttp) {
    var response = JSON.parse(xhttp.responseText);
    var seasonDates = Number(response.totalItems);//references dates that they have games
    var dates = response.dates;
    var html = "<table id=schedule> <tbody id=scheduleBody></tbody></table>";
    document.getElementById("scores").innerHTML = html;
    scheduleInfo2(dates, seasonDates);
}

//function scheduleInfo(dates, seasonDates) {
//    var html = "";
//    for (var i = 0; i < seasonDates; i++) { //loop through dates in season
//        var insertHTML = "";
//        var date = dates[i];
//        var numGames = date.totalGames;
//        for (var j = 0; j < numGames; j++) { //loop through games on the date incase there's ever a douhbleheader
//            var gameID = date.games[j].gamePk;
//            var awayID = date.games[j].teams.away.team.id;
//            var awayAbbr = getAbbr(awayID);
//            var awayScore = date.games[j].teams.away.score;
//            var homeID = date.games[j].teams.home.team.id;
//            var homeAbbr = getAbbr(homeID);
//            var homeScore = date.games[j].teams.home.score;
//            insertHTML += "<tr id=" + gameID + "><td class='team" + awayID + " away team' >" + awayAbbr + "</td>";
//            insertHTML += "<td class='away score'>" + awayScore + "</td>";
//            insertHTML += "<td class='team" + homeID + " home team'>" + homeAbbr + "</td>";
//            insertHTML += "<td class='home score'>" + homeScore + "</td></tr>";
            
//            insertHTML = findWinner(insertHTML, gameID, awayID, awayScore, homeID, homeScore);
//            var awaylink = makeTeamLink(awayID);
//            var homelink = makeTeamLink(homeID);
//            //var result = loadDoc(awaylink, teamAbbr, insertHTML);//currently this populates whole table each loop iteration
//            //loadDoc(homelink, teamAbbr, homeID);//may want to change how you populate team abbreviations and just do it once for whole table at end
//            //html += result;
//        }
//        html += insertHTML;
//        //document.getElementById("scheduleBody").appendChild(insertHTML);
//    }
//    //document.getElementById("scheduleBody").innerText = html;
//    document.getElementById("scheduleBody").innerHTML = html;
//}

function scheduleInfo2(dates, seasonDates) {
    for (var i = 0; i < seasonDates; i++) { //loop through dates in season
        var date = dates[i];
        var numGames = date.totalGames;
        for (var j = 0; j < numGames; j++) { //loop trhough games on the day in case theres ever a double header
            var obj = date.games[j]
            var gameID = obj.gamePk;
            var row = document.createElement("tr"); //make a row for each game
            row.id = gameID;
            for (var team in obj.teams) { //loop throug home and away teams
                var ID = obj.teams[team].team.id
                var node = document.createElement("td"); //make an element for each team
                node.classList.add(ID, "team" + ID, "team", team); //add classes
                link = makeTeamLink(ID);
                loadDoc(link, teamAbbr, node); //pass node to function that insert team abbreviation
                var scoreNode = document.createElement("td"); //make node for the score
                scoreNode.classList.add(team, "score"); //add classes
                var scoreText = document.createTextNode(obj.teams[team].score);
                scoreNode.appendChild(scoreText);
                row.appendChild(node);
                row.appendChild(scoreNode); //append team and score to row element
                //findWinner(row);
            }
            findWinner(row);
            document.getElementById("scheduleBody").appendChild(row); //append row element to table
        }
    }
}

function getGameID(xhttp) { //need gameID to get the correct link for last Chicago game
    var response = JSON.parse(xhttp.responseText)
    var gameID = response.teams[0].previousGameSchedule.dates[0].games[0].gamePk; //get gameID
    var link = makeGameLink(gameID); //get new link
    var result = loadDoc(link, getLineScore); //callback function to get the score
}

function getLineScore(xhttp) {
    var response = JSON.parse(xhttp.responseText);
    var body = document.getElementById("prevGameBody");

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var rawDate = response.periods[0].startTime;
    var msec = Date.parse(rawDate);
    var d = new Date(msec);
    var rawMonth = d.getMonth();
    var month = months[rawMonth];
    var day = d.getDate();

    var headerNode = document.createElement("tr")
    var dateNode = document.createElement("th")
    dateNode.id = "date";
    var dateText = document.createTextNode(month + " " + day);
    dateNode.appendChild(dateText);
    headerNode.appendChild(dateNode);

    var periods = response.periods;
    for (var period in periods) {
        var periodNode = document.createElement("th");
        var periodText = document.createTextNode(periods[period].ordinalNum);
        periodNode.appendChild(periodText);
        periodNode.classList.add("period_head");
        headerNode.appendChild(periodNode);
    }

    var finalNode = document.createElement("th");
    var finalText = document.createTextNode("Final");
    finalNode.appendChild(finalText);
    finalNode.classList.add("period_head");
    headerNode.appendChild(finalNode);
    body.appendChild(headerNode);

    for (var team in response.teams) {
        var row = document.createElement("tr");
        var teamNode = document.createElement("th");
        var teamText = document.createTextNode(response.teams[team].team.name)
        teamNode.appendChild(teamText);
        row.appendChild(teamNode);
        for (var p in periods) {
            var goals = periods[p][team].goals;
            var goalNode = document.createElement("td");
            var goalText = document.createTextNode(goals);
            goalNode.appendChild(goalText);
            row.appendChild(goalNode);
        }
        var totalNode = document.createElement("td");
        var totalText = document.createTextNode(response.teams[team].goals);
        totalNode.appendChild(totalText);
        row.appendChild(totalNode);
        body.appendChild(row);
    }
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



function teamAbbr(xhttp, node) {
    var response = JSON.parse(xhttp.responseText);
    var abbr = response.teams[0].abbreviation;
    var teamID = response.teams[0].id;
    var text = document.createTextNode(abbr);
    node.innerText = abbr;
}

function findWinner(row) {
    var c = row.childNodes;
    var awayScore = c[1].innerText;
    var homeScore = c[3].innerText;
    if (awayScore > homeScore) {
        c[0].classList.add("winner");
        c[1].classList.add("winner");
    }

    else if (homeScore > awayScore) {
        c[2].classList.add("winner");
        c[3].classList.add("winner");
    }
    //if (c[2].classList.contains("team16")) {
    //    var temp0 = c[2].cloneNode(deep = true);
    //    var temp1 = c[3].cloneNode(deep = true);
    //    var temp2 = c[0].cloneNode(deep = true);
    //    var temp3 = c[1].cloneNode(deep = true);
    //    row.replaceChild(temp0, row.childNodes[0]);
    //    row.replaceChild(temp1, row.childNodes[1]);
    //    row.replaceChild(temp2, row.childNodes[2]);
    //    row.replaceChild(temp3, row.childNodes[3]);
    //    document.getElementById("display").innerText = c[2].innerText;
    //}
    //else {
    //    document.getElementById("display").innerText = c[2].innerText;
    //}
    //document.getElementById("display").innerText = temp.length;
    //return row;
}


