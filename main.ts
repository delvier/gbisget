import * as gbis from "./gbis.js";

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
var searchTime: number = 0;  
var mainBox = (document.getElementById("main") as HTMLElement);
var keywordBox = (document.getElementById("keyword") as HTMLInputElement);
var resultBox = (document.getElementById("result") as HTMLElement);
var timetableBox = (document.getElementById("timetable") as HTMLElement);
var dateBox = (document.getElementById("sDay") as HTMLInputElement);
var prevLoc = window.location.hash;
const keywordSearch = async (_?: Event) => {
    var value = (keywordBox as HTMLInputElement).value.trim();
    if (!value) {
        window.location.hash = "";
        (document.getElementById("result") as HTMLElement).innerHTML = "";
        return;
    }
    timetableBox.style.display = "none";
    prevLoc = window.location.hash = `#/search/${value}`;
    var t = Date.now();
    resultBox.innerHTML = "<p>Loading...</p>";
    const doc = await gbis.main(value);
    if (searchTime > t) {
        return;
    } else {
        searchTime = t;
    }
    var tmp = ``;
    if (doc.querySelector("resultCode")?.innerHTML != "0") {
        tmp += doc.querySelector("resultMessage")?.innerHTML;
    }
    else {
        const x = doc.querySelectorAll("busRouteList");
        x.forEach((one) => {
            if (!resultBox) return;
            var reg = new RegExp(`^([A-Za-z가-힣]*)${escapeRegExp(value)}([-A-Za-z가-힣]*|-[-0-9]*)$`, 'i');
            if (! reg.test(`${one.querySelector("routeName")?.innerHTML}`)) {
                return;
            }
            if (one.querySelector("districtCd")?.innerHTML != "2") {
                return;
            }
            var exact = one.querySelector("routeName")?.innerHTML === value ;
            tmp += `<div><p class="routeItem" data-route-id=${one.querySelector("routeId")?.innerHTML}>${exact ? "<b>" : ""}${one.querySelector("routeName")?.innerHTML}${exact ? "</b>" : ""} (${one.querySelector("routeTypeName")?.innerHTML}): ${one.querySelector("stStaNm")?.innerHTML} → ${one.querySelector("edStaNm")?.innerHTML}</p></div>`;
        });
    }
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("routeItem");
    for (const link of links) {
        link.addEventListener("click", routeStopList);
    }
}
const routeStopList = async (_?: Event, id?: String) => {
    const routeId = id || (_?.target as HTMLElement).dataset.routeId || "";
    if (routeId === "") return;
    timetableBox.style.display = "none";
    prevLoc = window.location.hash = `#/route/${routeId}`;
    resultBox.innerHTML = "<p>Loading...</p>";
    const info = await gbis.info(routeId);
    const doc = await gbis.station(routeId);
    var tmp = ``;
    tmp += `<div id="routeInfo"><h2>${info.querySelector("routeName")?.innerHTML} (${info.querySelector("routeTypeName")?.innerHTML}): ${info.querySelector("startStationName")?.innerHTML} → ${info.querySelector("endStationName")?.innerHTML}</h2></div>`;
    const x = doc.querySelectorAll("busRouteStationList");
    x.forEach((one) => {
        if (!resultBox) return;
        const mobileCode = one.querySelector("mobileNo")?.innerHTML;
        tmp += `<div><p class="stopItem" data-route-id=${routeId} data-station-id=${one.querySelector("stationId")?.innerHTML} data-station-seq=${one.querySelector("stationSeq")?.innerHTML}>${one.querySelector("stationName")?.innerHTML} ${mobileCode ? `(${mobileCode})` : ``} <a href="geo:${one.querySelector("y")?.innerHTML},${one.querySelector("x")?.innerHTML}">📍</a></p></div>`;
    });
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("stopItem");
    for (const link of links) {
        link.addEventListener("click", routeStopHistory);
    }
}
const routeStopHistory = async (_?: Event, rid?: String, sid?: String, sord?: String, date?: String) => {
    const routeId = rid || (_?.target as HTMLElement).dataset.routeId || "";
    const stationId = sid || (_?.target as HTMLElement).dataset.stationId || "";
    const staOrder = sord || (_?.target as HTMLElement).dataset.stationSeq || "";
    const sDay = date || dateBox.value || "";
    if (routeId === "" || stationId === "" || staOrder === "" || sDay === "") return;
    if (resultBox.innerHTML == "") {
        routeStopList(_, routeId);
    }
    timetableBox.style.display = "flex";
    prevLoc = window.location.hash = `#/route/${routeId}`;
    window.location.hash = `#/history/${routeId}/${stationId}/${staOrder}/${sDay}`;
    (timetableBox.lastElementChild as Element).innerHTML = "<p>Loading...</p>";
    const doc = await gbis.pastarrival(sDay, routeId, stationId, staOrder);
    const x = doc.querySelectorAll("pastArrivalList");
    var tmp = ``;
    x.forEach((one) => {
        const arr = one.querySelector("RArrivalDate")?.innerHTML || "";
        tmp += `<div class="pastArrivalItem" data-veh-id=${one.querySelector("vehId")?.innerHTML}>${arr.split(" ")[1]}</div>`;
    });
    (timetableBox.lastElementChild as Element).innerHTML = tmp;
    mainBox.addEventListener("click", function closeTimetable (_) {
        timetableBox.style.display = "none";
        mainBox.removeEventListener("click", closeTimetable);
        window.location.hash = prevLoc;
    });
}
dateBox.addEventListener("change", (_) => {
    var params = window.location.hash.split("/");
    routeStopHistory(_, params[2], params[3], params[4], dateBox.value);
});
keywordBox.addEventListener("input", keywordSearch);
keywordBox.addEventListener("keydown", (_) => {
    if (_.key == "Enter") {
        keywordSearch(_);
    }
});
const initiator = async (_?: Event) => {
    var d = new Date();
    d.setTime(d.getTime() - 86400_000);
    dateBox.setAttribute("max", `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    dateBox.setAttribute("value", `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    if (window.location.hash.startsWith("#/")) {
        var params = window.location.hash.split("/");
        if (params[1] === "search") {
            var value = params[2];
            keywordBox.value = value;
            await keywordSearch();
        } else if (params[1] === "route") {
            var value = params[2];
            await routeStopList(_, value);
        } else if (params[1] === "history" && params.length > 4) {
            var rid = params[2];
            var sid = params[3];
            var sord = params[4];
            var date;
            if (params.length === 5)
                date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            else
                date = params[5];
            await routeStopHistory(_, rid, sid, sord, date);
        } else {
            window.location.hash = "";
        }
    }
}
//window.addEventListener("hashchange", (_) => {
//    console.log(_.oldURL);
//    console.log(_.newURL);
//    initiator(_);
//});
document.querySelector("h1")?.addEventListener("click", (_) => {
    window.location.hash = "";
    keywordBox.value = "";
    resultBox.innerHTML = "";
});
initiator();