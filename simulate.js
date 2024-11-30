/*
    This file is part of HSR Warp Simulator.
    HSR Warp Simulator is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
    HSR Warp Simulator is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
    You should have received a copy of the GNU General Public License along with HSR Warp Simulator. If not, see <https://www.gnu.org/licenses/>.  
*/
let charPity5050 = {"starrailstation": 0.5625, "hsrwarp": 0.5}
let charPityStart = {"starrailstation": 73, "hsrwarp": 75}
let charPityRamp = {"starrailstation": 0.06, "hsrwarp": 0.06}
let lcPity5050 = {"starrailstation": 0.7825, "hsrwarp":0.75}
let lcPityStart = {"starrailstation": 65, "hsrwarp": 65}
let lcPityRamp = {"starrailstation": 0.07, "hsrwarp": 0.06}

var module = module || {};
module.exports = { analyzeSections,  pullMultiple, showResults, pullCharacter, checkPull, checkLcPull, pullLc};

function analyzeSections(results, inputData) {
    let totalTickets = inputData["tickets"];
    let numAttempts = inputData["numSims"];
    let minNeeded = numAttempts/100;
    let simResults = [];
    for (var i = results.length - 1; i >= 0; i--) {
        var result = results[i];
        const ticketsUsed = result.ticketsUsed;
        const numBins = Math.floor(totalTickets / 5);
        const binArray = Array(numBins).fill(0);

        ticketsUsed.forEach(tickets => {
            const bin = Math.floor((tickets - 1) / 5);
            binArray[bin] += 1;
        });

        let totalTicketsUsed = 0;
        let currentMax = 0;

        binArray.forEach((binCount, j) => {
            if (totalTicketsUsed === 0 && binCount === 0) {
                return;
            }
            totalTicketsUsed += binCount;
            if (binCount > (currentMax * 0.8)) {
                currentMax = binCount;
            } else if (totalTicketsUsed >= minNeeded) {
                console.log(`Total pulled ${i}: chance: ${totalTicketsUsed / numAttempts} tickets used: ${j * 5}`);
                simResults.push({"numPulled": i, "chance": totalTicketsUsed / numAttempts, "ticketsUsed":j * 5});
                totalTicketsUsed = 0;
                currentMax = 0;
            }
        });

        if (totalTicketsUsed > 0) {
            console.log(`Total pulled ${i}: chance: ${totalTicketsUsed / numAttempts} tickets used: ${(numBins) * 5}`);
            simResults.push({"numPulled": i, "chance": totalTicketsUsed / numAttempts, "ticketsUsed":(numBins) * 5});
        }
    }
    return simResults;
}

function showResults(pullArray, simResults) {
    headerDiv = document.getElementById("results_header");
    headerDiv.style["display"] = "flex";

    outputDiv = document.getElementById("results");
    while(outputDiv.firstChild) {
        outputDiv.removeChild(outputDiv.lastChild);
    }

    prevCount = -1;
    for(let i = 0; i < simResults.length; i++) {
        let simResult = simResults[i];
        resultNode = createResultNode(pullArray, simResult, prevCount);
        outputDiv.appendChild(resultNode);
        prevCount = simResult["ticketsUsed"];
    }
}

function createResultNode(pullArray, simResult, prevCount) {
    resultNode = document.createElement("div");
    resultNode.className = "result-item";

    imageDiv = document.createElement("div");
    imageDiv.className = "result-icons";
    for(var i = 0; i < simResult["numPulled"]; i++) {
        addResultImg(imageDiv, pullArray[i]);
    }
    resultNode.appendChild(imageDiv);

    displayDiv = document.createElement("div");
    displayDiv.className = "result-details";

    chanceDiv = document.createElement("div");
    chanceDiv.className = "result-chance"

    pct = `${(simResult["chance"] * 100).toFixed(2)}%`
    bar_chance = simResult["chance"] > 0.8 ? 1 : simResult["chance"] * 1.25;
    bar_pct = `${(bar_chance * 100).toFixed(2)}%`
    percentDiv = document.createElement("div");
    percentDiv.className = "chance-bar";
    percentDiv.style["width"] = bar_pct

    percentText = document.createTextNode(pct);

    percentDiv.appendChild(percentText);
    chanceDiv.appendChild(percentDiv);
    displayDiv.appendChild(chanceDiv);
    resultNode.appendChild(displayDiv);

    ticketDiv = document.createElement("div");
    ticketDiv.className = "result-tickets";

    ticketSpan = document.createElement("span");
    ticketSpan.className = "tickets-used";

    ticketStr = `${simResult["ticketsUsed"]}`;
    if (prevCount == -1) {
        ticketStr = `${simResult["ticketsUsed"]} or less`;
    }
    else if (prevCount != simResult["ticketsUsed"]) {
        ticketStr = `${simResult["ticketsUsed"]} to ${prevCount + 1}`;
    }
    ticketText = document.createTextNode(ticketStr);

    ticketSpan.appendChild(ticketText);
    ticketDiv.appendChild(ticketSpan);
    resultNode.appendChild(ticketDiv);

    return resultNode;
}

function addResultImg(imageDiv, pullType) {
    let imgSrc = "character_icon.png";
    let altText = "Character";
    if (pullType === "L") {
        imgSrc = "lightcone_icon.png";
        altText = "Light Cone";
    }
    imgNode = document.createElement("img");
    imgNode.className = "result-icon";
    imgNode.alt = altText;
    imgNode.src = imgSrc;

    imageDiv.appendChild(imgNode);
}

function pullMultiple(input_data) {
    console.log("Input data: " + JSON.stringify(input_data));
    let pullArray = input_data["pullTypes"];
    let mpTicketsAvail = input_data["tickets"];
    let numSims = input_data["numSims"];
    let pityKey = "starrailstation";
    if (input_data["pityKey"] !== undefined && input_data["pityKey"] !== null) {
        pityKey = input_data["pityKey"];
    }
    const results = Array.from({ length: pullArray.length + 1 }, () => ({ ticketsUsed: [] }));
    let minTicketsUsed = mpTicketsAvail + 1;
    let maxTicketsUsed = 0;

    for (let i = 0; i < numSims; i++) {
        let mpTickets = mpTicketsAvail;
        let resultIndex = 0;
        let simCharGuarantee = input_data["charGuarantee"];
        let simCharPity = input_data["charPity"];
        let simLCGuarantee = input_data["lcGuarantee"];
        let simLCPity = input_data["lcPity"];

        for (const pullType of pullArray) {
            let usedTickets, gotLimited, wonSplit, luckyPull;

            if (pullType === "C") {
                ({ usedTickets, gotLimited, wonSplit, luckyPull } = pullCharacter(mpTickets, simCharPity, simCharGuarantee, pityKey));
                simCharGuarantee = false;
                simCharPity = 0;
            } else if (pullType === "L") {
                ({ usedTickets, gotLimited, wonSplit, luckyPull } = pullLc(mpTickets, simLCPity, simLCGuarantee, pityKey));
                simLCGuarantee = false;
                simLCPity = 0;
            } else {
                console.log(`Unknown pull type ${pullType}`);
                continue;
            }

            if (gotLimited) {
                resultIndex += 1;
            }
            mpTickets -= usedTickets;
        }

        const totalTicketsUsed = mpTicketsAvail - mpTickets;
        if (totalTicketsUsed < minTicketsUsed) {
            minTicketsUsed = totalTicketsUsed;
        }
        if (totalTicketsUsed > maxTicketsUsed) {
            maxTicketsUsed = totalTicketsUsed;
        }
        results[resultIndex].ticketsUsed.push(totalTicketsUsed);
    }

    results.forEach((result, i) => {
        console.log(`For total limited pulled ${i}: ${result.ticketsUsed.length / numSims}`);
    });

    return results;
}

function pullCharacter(tickets, pity, guaranteed = false, pityKey = "starrailstation") {
    let usedTickets = 0;
    let pullCount = pity;
    let luckyPull = false;
    let won5050 = false;
    let gotLimited = false;

    while (tickets > 0) {
        pullCount += 1;
        usedTickets += 1;
        tickets -= 1;
        const { pulledChar, isLucky } = checkPull(pullCount, pityKey);
        
        if (pulledChar) {
            if (isLucky) {
                luckyPull = true;
            }
            if (guaranteed) {
                gotLimited = true;
            } else {
                const charRng = Math.random();
                if (charRng <= charPity5050[pityKey]) {
                    won5050 = true;
                    gotLimited = true;
                }
            }
            if (gotLimited) {
                break;
            } else {
                pullCount = 0;
                guaranteed = true;
            }
        }
    }
    return { usedTickets, gotLimited, won5050, luckyPull };
}

function checkPull(pullCount, pityKey="starrailstation") {
    const pullRng = Math.random();
    if (pullCount <= charPityStart[pityKey]) {
        if (pullRng <= 0.006) {
            return { pulledChar: true, isLucky: true };
        } else {
            return { pulledChar: false, isLucky: false };
        }
    } else {
        let pullChance;
        if (pullCount < 90) {
            pullChance = 0.006 + ((pullCount - charPityStart[pityKey]) * charPityRamp[pityKey]);
        } else {
            pullChance = 1;
        }
        if (pullRng <= pullChance) {
            return { pulledChar: true, isLucky: false };
        } else {
            return { pulledChar: false, isLucky: false };
        }
    }
}

function pullLc(tickets, pity, guaranteed = false, pityKey = "starrailstation") {
    let usedTickets = 0;
    let pullCount = pity;
    let luckyPull = false;
    let won7525 = false;
    let gotLimited = false;

    while (tickets > 0) {
        pullCount += 1;
        usedTickets += 1;
        tickets -= 1;
        const { pulledLc, isLucky } = checkLcPull(pullCount, pityKey);

        if (pulledLc) {
            if (isLucky) {
                luckyPull = true;
            }
            if (guaranteed) {
                gotLimited = true;
            } else {
                const charRng = Math.random();
                if (charRng <= lcPity5050[pityKey]) {
                    won7525 = true;
                    gotLimited = true;
                }
            }
            if (gotLimited) {
                break;
            } else {
                pullCount = 0;
                guaranteed = true;
            }
        }
    }
    return { usedTickets, gotLimited, won7525, luckyPull };
}

function checkLcPull(pullCount, pityKey = "starrailstation") {
    const pullRng = Math.random();
    if (pullCount <= lcPityStart[pityKey]) {
        if (pullRng <= 0.008) {
            return { pulledLc: true, isLucky: true };
        } else {
            return { pulledLc: false, isLucky: false };
        }
    } else {
        let pullChance;
        if (pullCount < 80) {
            pullChance = 0.008 + ((pullCount - lcPityStart[pityKey]) * lcPityRamp[pityKey]);
        } else {
            pullChance = 1;
        }
        if (pullRng <= pullChance) {
            return { pulledLc: true, isLucky: false };
        } else {
            return { pulledLc: false, isLucky: false };
        }
    }
}