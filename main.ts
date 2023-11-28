import * as gbis from "./gbis.js";

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
var searchTime: number = 0;  
var mainBox = (document.getElementById("main") as HTMLElement);
var keywordBox = (document.getElementById("keyword") as HTMLInputElement);
var searchMode = (document.getElementById("isStation") as HTMLInputElement);
var resultBox = (document.getElementById("result") as HTMLElement);
var timetableBox = (document.getElementById("timetable") as HTMLElement);
var timetableShadow = (document.getElementById("timetable-mask") as HTMLElement);
var dateBox = (document.getElementById("sDay") as HTMLInputElement);
var prevLoc = window.location.hash;
var already: boolean = false; // Prevents hashchange loop
const routeSearch = async (_?: Event) => {
    var value = (keywordBox as HTMLInputElement).value.trim();
    if (!value) {
        already = true;
        window.location.hash = "";
        (document.getElementById("result") as HTMLElement).innerHTML = "";
        return;
    }
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    if (_) already = true;
    prevLoc = window.location.hash = `#/search/${value}`;
    var t = Date.now();
    resultBox.innerHTML = "<p>Loading...</p>";
    const doc = await gbis.routeMain(value);
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
            var reg: RegExp;
            if (value.length == 1) 
                reg = new RegExp(`^([A-Za-z가-힣]*)${escapeRegExp(value)}([-A-Za-z가-힣]*|-[-0-9]*)$`, 'i');
            else
                reg = new RegExp(`${escapeRegExp(value)}`, 'i');
            if (! reg.test(`${one.querySelector("routeName")?.innerHTML}`)) {
                return;
            }
            var exact = one.querySelector("routeName")?.innerHTML === value ;
            tmp += `<div class="routeItem" data-route-id=${one.querySelector("routeId")?.innerHTML}><a href="#/route/${one.querySelector("routeId")?.innerHTML}">${exact ? "<b>" : ""}${one.querySelector("routeName")?.innerHTML}${exact ? "</b>" : ""} (${one.querySelector("routeTypeName")?.innerHTML}): ${one.querySelector("stStaNm")?.innerHTML} → ${one.querySelector("edStaNm")?.innerHTML}</a></div>`
        });
    }
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("routeItem");
    for (const link of links) {
        link.addEventListener("click", routeStopList);
    }
}
const routeStopList = async (_?: Event, id?: String, silent?: boolean) => {
    const routeId = id || (_?.target as HTMLElement).dataset.routeId || "";
    if (routeId === "") return;
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    if (_) already = true;
    if (!silent)
        prevLoc = window.location.hash = `#/route/${routeId}`;
    resultBox.innerHTML = "<p>Loading...</p>";
    const info = await gbis.routeInfo(routeId);
    const doc = await gbis.routeStation(routeId);
    var tmp = ``;
    if (keywordBox.value == "") {
        keywordBox.value = info.querySelector("routeName")?.innerHTML || "";
    };
    tmp += `<div id="routeInfo"><h2>${info.querySelector("routeName")?.innerHTML} (${info.querySelector("routeTypeName")?.innerHTML}): ${info.querySelector("startStationName")?.innerHTML} → ${info.querySelector("endStationName")?.innerHTML}</h2></div>`;
    const x = doc.querySelectorAll("busRouteStationList");
    const sDay = dateBox.value || "";
    x.forEach((one) => {
        if (!resultBox) return;
        const mobileCode = one.querySelector("mobileNo")?.innerHTML;
        tmp += `<div class="stopItem" data-route-id=${routeId} data-station-id=${one.querySelector("stationId")?.innerHTML} data-station-seq=${one.querySelector("stationSeq")?.innerHTML}><a href="#/history/${routeId}/${one.querySelector("stationId")?.innerHTML}/${one.querySelector("stationSeq")?.innerHTML}/${sDay}">${one.querySelector("stationName")?.innerHTML} ${mobileCode ? `(${mobileCode})` : ``}</a> <a href="geo:${one.querySelector("y")?.innerHTML},${one.querySelector("x")?.innerHTML}">📍</a></div>`
    });
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("stopItem");
    for (const link of links) {
        link.addEventListener("click", routeStopHistory);
    }
}
const stopSearch = async (_?: Event) => {
    var value = (keywordBox as HTMLInputElement).value.trim();
    if (!value) {
        already = true;
        window.location.hash = "";
        (document.getElementById("result") as HTMLElement).innerHTML = "";
        return;
    }
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    if (_) already = true;
    prevLoc = window.location.hash = `#/s-search/${value}`;
    var t = Date.now();
    resultBox.innerHTML = "<p>Loading...</p>";
    const doc = await gbis.stationMain(value);
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
        const x = doc.querySelectorAll("busStationList");
        x.forEach((one) => {
            if (!resultBox) return;
            var exact = one.querySelector("stationName")?.innerHTML === value ;
            const mobileCode = one.querySelector("mobileNo")?.innerHTML;
            tmp += `<div class="stationItem" data-station-id=${one.querySelector("stationId")?.innerHTML}><a href="#/station/${one.querySelector("stationId")?.innerHTML}">${exact ? "<b>" : ""}${one.querySelector("stationName")?.innerHTML}${exact ? "</b>" : ""} (${one.querySelector("regionName")?.innerHTML}${mobileCode ? `: ${mobileCode}` : ``})</a></div>`
        });
    }
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("stationItem");
    for (const link of links) {
        link.addEventListener("click", stopRouteList);
    }
}
const stopRouteList = async (_?: Event, id?: String) => {
    const stationId = id || (_?.target as HTMLElement).dataset.stationId || "";
    if (stationId === "") return;
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    if (_) already = true;
    prevLoc = window.location.hash = `#/station/${stationId}`;
    resultBox.innerHTML = "<p>Loading...</p>";
    const info = await gbis.stationInfo(stationId);
    const doc = await gbis.stationRoute(stationId);
    var tmp = ``;
    if (keywordBox.value == "") {
        keywordBox.value = info.querySelector("stationName")?.innerHTML || "";
    };
    const mobileCode = info.querySelector("mobileNo")?.innerHTML;
    tmp += `<div id="stationInfo"><h2>${info.querySelector("stationName")?.innerHTML} (${info.querySelector("regionName")?.innerHTML}${mobileCode ? `: ${mobileCode}` : ``}) <a href="geo:${info.querySelector("y")?.innerHTML},${info.querySelector("x")?.innerHTML}">📍</a></h2></div>`;
    const x = doc.querySelectorAll("busRouteList");
    const sDay = dateBox.value || "";
    x.forEach((one) => {
        if (!resultBox) return;
        tmp += `<div class="stopItem" data-route-id=${one.querySelector("routeId")?.innerHTML} data-station-id=${stationId} data-station-seq=${one.querySelector("stationSeq")?.innerHTML}><a href="#/history/${one.querySelector("routeId")?.innerHTML}/${stationId}/${one.querySelector("stationSeq")?.innerHTML}/${sDay}">${one.querySelector("routeName")?.innerHTML} (→ ${one.querySelector("routeDestName")?.innerHTML})</a></div>`
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
        routeStopList(_, routeId, true);
    }
    timetableBox.style.display = "flex";
    timetableShadow.style.display = "block";
    prevLoc = prevLoc ? prevLoc : `#/route/${routeId}`;
    if (_) already = true;
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
    timetableShadow.addEventListener("click", closeTimetable);
}
dateBox.addEventListener("change", (_) => {
    var params = window.location.hash.split("/");
    routeStopHistory(_, params[2], params[3], params[4], dateBox.value);
});
keywordBox.addEventListener("input", (_) => {
    if (searchMode.checked) stopSearch(_);
    else routeSearch(_);
});
keywordBox.addEventListener("keydown", (_) => {
    if (_.key == "Enter") {
        if (searchMode.checked) stopSearch(_);
        else routeSearch(_);
    }
});
searchMode.addEventListener("change", (_) => {
    if (searchMode.checked) {
        keywordBox.setAttribute("placeholder", "정류소");
        stopSearch(_);
    } else {
        keywordBox.setAttribute("placeholder", "노선 번호");
        routeSearch(_);
    }
})
const initiator = async (_?: Event) => {
    already = true;
    var d = new Date();
    d.setTime(d.getTime() - 86400_000);
    dateBox.setAttribute("max", `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    dateBox.setAttribute("value", `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    if (window.location.hash.startsWith("#/")) {
        var params = window.location.hash.split("/");
        if (params[1] === "search") {
            var value = decodeURI(params[2]);
            keywordBox.value = value;
            await routeSearch(_);
        } else if (params[1] === "s-search") {
            var value = decodeURI(params[2]);
            searchMode.checked = true;
            keywordBox.setAttribute("placeholder", "정류소");
            keywordBox.value = value;
            await stopSearch(_);
        } else if (params[1] === "route") {
            var value = params[2];
            await routeStopList(_, value);
        } else if (params[1] === "station") {
            var value = params[2];
            searchMode.checked = true;
            keywordBox.setAttribute("placeholder", "정류소");
            await stopRouteList(_, value);
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
            already = true;
            window.location.hash = "";
        }
    }
}
window.addEventListener("hashchange", (_) => {
    if (!already) initiator(_);
    else already = false;
});
document.querySelector("h1")?.addEventListener("click", (_) => {
    already = true;
    window.location.hash = "";
    keywordBox.value = "";
    resultBox.innerHTML = "";
});
const closeTimetable = (_: Event) => {
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    timetableShadow.removeEventListener("click", closeTimetable);
    already = true;
    window.location.hash = prevLoc;
}
document.getElementById("timetable-close")?.addEventListener("click", closeTimetable);
initiator();
