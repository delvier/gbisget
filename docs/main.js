var _a, _b;
import * as gbis from "./gbis.js";
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
var searchTime = 0;
var mainBox = document.getElementById("main");
var keywordBox = document.getElementById("keyword");
var searchMode = document.getElementById("isStation");
var resultBox = document.getElementById("result");
var timetableBox = document.getElementById("timetable");
var timetableShadow = document.getElementById("timetable-mask");
var dateBox = document.getElementById("sDay");
var prevLoc = window.location.hash;
var already = false; // Prevents hashchange loop
const routeSearch = async (_) => {
    var _a, _b;
    var value = keywordBox.value.trim();
    if (!value) {
        already = true;
        window.location.hash = "";
        document.getElementById("result").innerHTML = "";
        return;
    }
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    prevLoc = `#/search/${value}`;
    var t = Date.now();
    resultBox.innerHTML = "<p>Loading...</p>";
    const doc = await gbis.routeMain(value);
    if (searchTime > t) {
        return;
    }
    else {
        searchTime = t;
    }
    var tmp = ``;
    if (((_a = doc.querySelector("resultCode")) === null || _a === void 0 ? void 0 : _a.innerHTML) != "0") {
        tmp += (_b = doc.querySelector("resultMessage")) === null || _b === void 0 ? void 0 : _b.innerHTML;
    }
    else {
        const x = doc.querySelectorAll("busRouteList");
        x.forEach((one) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (!resultBox)
                return;
            var reg;
            if (value.length == 1)
                reg = new RegExp(`^([A-Za-z가-힣]*)${escapeRegExp(value)}([-A-Za-z가-힣]*|-[-0-9]*)$`, 'i');
            else
                reg = new RegExp(`${escapeRegExp(value)}`, 'i');
            if (!reg.test(`${(_a = one.querySelector("routeName")) === null || _a === void 0 ? void 0 : _a.innerHTML}`)) {
                return;
            }
            var exact = ((_b = one.querySelector("routeName")) === null || _b === void 0 ? void 0 : _b.innerHTML) === value;
            tmp += `<div class="routeItem" data-route-id=${(_c = one.querySelector("routeId")) === null || _c === void 0 ? void 0 : _c.innerHTML}><a href="#/route/${(_d = one.querySelector("routeId")) === null || _d === void 0 ? void 0 : _d.innerHTML}">${exact ? "<b>" : ""}${(_e = one.querySelector("routeName")) === null || _e === void 0 ? void 0 : _e.innerHTML}${exact ? "</b>" : ""} (${(_f = one.querySelector("routeTypeName")) === null || _f === void 0 ? void 0 : _f.innerHTML}): ${(_g = one.querySelector("stStaNm")) === null || _g === void 0 ? void 0 : _g.innerHTML} → ${(_h = one.querySelector("edStaNm")) === null || _h === void 0 ? void 0 : _h.innerHTML}</a></div>`;
        });
    }
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("routeItem");
    for (const link of links) {
        link.addEventListener("click", (_) => {
            const routeId = link.dataset.routeId;
            window.location.hash = `#/route/${routeId}`;
        });
    }
};
const routeStopList = async (_, id, silent) => {
    var _a, _b, _c, _d, _e;
    const routeId = id || (_ === null || _ === void 0 ? void 0 : _.target).dataset.routeId || "";
    if (routeId === "")
        return;
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    if (!silent)
        prevLoc = `#/route/${routeId}`;
    resultBox.innerHTML = "<p>Loading...</p>";
    const info = await gbis.routeInfo(routeId);
    const doc = await gbis.routeStation(routeId);
    var tmp = ``;
    if (keywordBox.value == "") {
        keywordBox.value = ((_a = info.querySelector("routeName")) === null || _a === void 0 ? void 0 : _a.innerHTML) || "";
    }
    ;
    tmp += `<div id="routeInfo"><h2>${(_b = info.querySelector("routeName")) === null || _b === void 0 ? void 0 : _b.innerHTML} (${(_c = info.querySelector("routeTypeName")) === null || _c === void 0 ? void 0 : _c.innerHTML}): ${(_d = info.querySelector("startStationName")) === null || _d === void 0 ? void 0 : _d.innerHTML} → ${(_e = info.querySelector("endStationName")) === null || _e === void 0 ? void 0 : _e.innerHTML}</h2></div>`;
    const x = doc.querySelectorAll("busRouteStationList");
    const sDay = dateBox.value || "";
    x.forEach((one) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!resultBox)
            return;
        const mobileCode = (_a = one.querySelector("mobileNo")) === null || _a === void 0 ? void 0 : _a.innerHTML;
        tmp += `<div class="stopItem" data-route-id=${routeId} data-station-id=${(_b = one.querySelector("stationId")) === null || _b === void 0 ? void 0 : _b.innerHTML} data-station-seq=${(_c = one.querySelector("stationSeq")) === null || _c === void 0 ? void 0 : _c.innerHTML}><a href="#/history/${routeId}/${(_d = one.querySelector("stationId")) === null || _d === void 0 ? void 0 : _d.innerHTML}/${(_e = one.querySelector("stationSeq")) === null || _e === void 0 ? void 0 : _e.innerHTML}/${sDay}">${(_f = one.querySelector("stationName")) === null || _f === void 0 ? void 0 : _f.innerHTML} ${mobileCode ? `(${mobileCode})` : ``}</a> <a href="geo:${(_g = one.querySelector("y")) === null || _g === void 0 ? void 0 : _g.innerHTML},${(_h = one.querySelector("x")) === null || _h === void 0 ? void 0 : _h.innerHTML}">📍</a></div>`;
    });
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("stopItem");
    for (const link of links) {
        link.addEventListener("click", (_) => {
            const routeId = link.dataset.routeId;
            const stationId = link.dataset.stationId;
            const staOrder = link.dataset.stationSeq;
            window.location.hash = `#/history/${routeId}/${stationId}/${staOrder}/${sDay}`;
        });
    }
};
const stopSearch = async (_) => {
    var _a, _b;
    var value = keywordBox.value.trim();
    if (!value) {
        already = true;
        window.location.hash = "";
        document.getElementById("result").innerHTML = "";
        return;
    }
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    prevLoc = `#/s-search/${value}`;
    var t = Date.now();
    resultBox.innerHTML = "<p>Loading...</p>";
    const doc = await gbis.stationMain(value);
    if (searchTime > t) {
        return;
    }
    else {
        searchTime = t;
    }
    var tmp = ``;
    if (((_a = doc.querySelector("resultCode")) === null || _a === void 0 ? void 0 : _a.innerHTML) != "0") {
        tmp += (_b = doc.querySelector("resultMessage")) === null || _b === void 0 ? void 0 : _b.innerHTML;
    }
    else {
        const x = doc.querySelectorAll("busStationList");
        x.forEach((one) => {
            var _a, _b, _c, _d, _e, _f;
            if (!resultBox)
                return;
            var exact = ((_a = one.querySelector("stationName")) === null || _a === void 0 ? void 0 : _a.innerHTML) === value;
            const mobileCode = (_b = one.querySelector("mobileNo")) === null || _b === void 0 ? void 0 : _b.innerHTML;
            tmp += `<div class="stationItem" data-station-id=${(_c = one.querySelector("stationId")) === null || _c === void 0 ? void 0 : _c.innerHTML}><a href="#/station/${(_d = one.querySelector("stationId")) === null || _d === void 0 ? void 0 : _d.innerHTML}">${exact ? "<b>" : ""}${(_e = one.querySelector("stationName")) === null || _e === void 0 ? void 0 : _e.innerHTML}${exact ? "</b>" : ""} (${(_f = one.querySelector("regionName")) === null || _f === void 0 ? void 0 : _f.innerHTML}${mobileCode ? `: ${mobileCode}` : ``})</a></div>`;
        });
    }
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("stationItem");
    for (const link of links) {
        link.addEventListener("click", (_) => {
            const stationId = link.dataset.stationId;
            window.location.hash = `#/station/${stationId}`;
        });
    }
};
const stopRouteList = async (_, id) => {
    var _a, _b, _c, _d, _e, _f;
    const stationId = id || (_ === null || _ === void 0 ? void 0 : _.target).dataset.stationId || "";
    if (stationId === "")
        return;
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    prevLoc = `#/station/${stationId}`;
    resultBox.innerHTML = "<p>Loading...</p>";
    const info = await gbis.stationInfo(stationId);
    const doc = await gbis.stationRoute(stationId);
    var tmp = ``;
    if (keywordBox.value == "") {
        keywordBox.value = ((_a = info.querySelector("stationName")) === null || _a === void 0 ? void 0 : _a.innerHTML) || "";
    }
    ;
    const mobileCode = (_b = info.querySelector("mobileNo")) === null || _b === void 0 ? void 0 : _b.innerHTML;
    tmp += `<div id="stationInfo"><h2>${(_c = info.querySelector("stationName")) === null || _c === void 0 ? void 0 : _c.innerHTML} (${(_d = info.querySelector("regionName")) === null || _d === void 0 ? void 0 : _d.innerHTML}${mobileCode ? `: ${mobileCode}` : ``}) <a href="geo:${(_e = info.querySelector("y")) === null || _e === void 0 ? void 0 : _e.innerHTML},${(_f = info.querySelector("x")) === null || _f === void 0 ? void 0 : _f.innerHTML}">📍</a></h2></div>`;
    const x = doc.querySelectorAll("busRouteList");
    const sDay = dateBox.value || "";
    x.forEach((one) => {
        var _a, _b, _c, _d, _e, _f;
        if (!resultBox)
            return;
        tmp += `<div class="stopItem" data-route-id=${(_a = one.querySelector("routeId")) === null || _a === void 0 ? void 0 : _a.innerHTML} data-station-id=${stationId} data-station-seq=${(_b = one.querySelector("staOrder")) === null || _b === void 0 ? void 0 : _b.innerHTML}><a href="#/history/${(_c = one.querySelector("routeId")) === null || _c === void 0 ? void 0 : _c.innerHTML}/${stationId}/${(_d = one.querySelector("staOrder")) === null || _d === void 0 ? void 0 : _d.innerHTML}/${sDay}">${(_e = one.querySelector("routeName")) === null || _e === void 0 ? void 0 : _e.innerHTML} (→ ${(_f = one.querySelector("routeDestName")) === null || _f === void 0 ? void 0 : _f.innerHTML})</a></div>`;
    });
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("stopItem");
    for (const link of links) {
        link.addEventListener("click", (_) => {
            const routeId = link.dataset.routeId;
            const stationId = link.dataset.stationId;
            const staOrder = link.dataset.stationSeq;
            window.location.hash = `#/history/${routeId}/${stationId}/${staOrder}/${sDay}`;
        });
    }
};
const routeStopHistory = async (_, rid, sid, sord, date) => {
    const routeId = rid || (_ === null || _ === void 0 ? void 0 : _.target).dataset.routeId || "";
    const stationId = sid || (_ === null || _ === void 0 ? void 0 : _.target).dataset.stationId || "";
    const staOrder = sord || (_ === null || _ === void 0 ? void 0 : _.target).dataset.stationSeq || "";
    const sDay = date || dateBox.value || "";
    if (routeId === "" || stationId === "" || staOrder === "" || sDay === "")
        return;
    if (resultBox.innerHTML == "") {
        routeStopList(_, routeId, true);
    }
    timetableBox.style.display = "flex";
    timetableShadow.style.display = "block";
    prevLoc = prevLoc ? prevLoc : `#/route/${routeId}`;
    already = true;
    timetableBox.lastElementChild.innerHTML = "<p>Loading...</p>";
    const doc = await gbis.pastarrival(sDay, routeId, stationId, staOrder);
    const x = doc.querySelectorAll("pastArrivalList");
    var tmp = ``;
    x.forEach((one) => {
        var _a, _b;
        const arr = ((_a = one.querySelector("RArrivalDate")) === null || _a === void 0 ? void 0 : _a.innerHTML) || "";
        tmp += `<div class="pastArrivalItem" data-veh-id=${(_b = one.querySelector("vehId")) === null || _b === void 0 ? void 0 : _b.innerHTML}>${arr.split(" ")[1]}</div>`;
    });
    timetableBox.lastElementChild.innerHTML = tmp;
    timetableShadow.addEventListener("click", closeTimetable);
};
dateBox.addEventListener("change", (_) => {
    var params = window.location.hash.split("/");
    routeStopHistory(_, params[2], params[3], params[4], dateBox.value);
});
keywordBox.addEventListener("input", (_) => {
    if (searchMode.checked)
        stopSearch(_);
    else
        routeSearch(_);
});
keywordBox.addEventListener("keydown", (_) => {
    if (_.key == "Enter") {
        if (searchMode.checked)
            stopSearch(_);
        else
            routeSearch(_);
    }
});
searchMode.addEventListener("change", (_) => {
    if (searchMode.checked) {
        keywordBox.setAttribute("placeholder", "정류소");
        stopSearch(_);
    }
    else {
        keywordBox.setAttribute("placeholder", "노선 번호");
        routeSearch(_);
    }
});
const initiator = async (_) => {
    var d = new Date();
    d.setTime(d.getTime() - 86400000);
    dateBox.setAttribute("max", `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    dateBox.setAttribute("value", `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    if (window.location.hash.startsWith("#/")) {
        var params = window.location.hash.split("/");
        if (params[1] === "search") {
            var value = decodeURI(params[2]);
            keywordBox.value = value;
            await routeSearch(_);
        }
        else if (params[1] === "s-search") {
            var value = decodeURI(params[2]);
            searchMode.checked = true;
            keywordBox.setAttribute("placeholder", "정류소");
            keywordBox.value = value;
            await stopSearch(_);
        }
        else if (params[1] === "route") {
            var value = params[2];
            await routeStopList(_, value);
        }
        else if (params[1] === "station") {
            var value = params[2];
            searchMode.checked = true;
            keywordBox.setAttribute("placeholder", "정류소");
            await stopRouteList(_, value);
        }
        else if (params[1] === "history" && params.length > 4) {
            var rid = params[2];
            var sid = params[3];
            var sord = params[4];
            var date;
            if (params.length === 5)
                date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            else
                date = params[5];
            await routeStopHistory(_, rid, sid, sord, date);
        }
        else {
            already = true;
            window.location.hash = "";
        }
    }
};
window.addEventListener("hashchange", (_) => {
    if (!already)
        initiator(_);
    else
        already = false;
});
(_a = document.querySelector("h1")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (_) => {
    already = true;
    window.location.hash = "";
    keywordBox.value = "";
    resultBox.innerHTML = "";
});
const closeTimetable = async (_) => {
    timetableBox.style.display = "none";
    timetableShadow.style.display = "none";
    timetableShadow.removeEventListener("click", closeTimetable);
    already = true;
    window.location.hash = prevLoc;
};
(_b = document.getElementById("timetable-close")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", closeTimetable);
initiator();
