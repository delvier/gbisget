var _a;
import * as gbis from "./gbis.js";
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
var searchTime = 0;
var mainBox = document.getElementById("main");
var keywordBox = document.getElementById("keyword");
var resultBox = document.getElementById("result");
var timetableBox = document.getElementById("timetable");
var dateBox = document.getElementById("sDay");
var prevLoc = window.location.hash;
const keywordSearch = async (_) => {
    var _a, _b;
    var value = keywordBox.value.trim();
    if (!value) {
        window.location.hash = "";
        document.getElementById("result").innerHTML = "";
        return;
    }
    timetableBox.style.display = "none";
    prevLoc = window.location.hash = `#/search/${value}`;
    var t = Date.now();
    resultBox.innerHTML = "<p>Loading...</p>";
    const doc = await gbis.main(value);
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
            var reg = new RegExp(`^([A-Za-z가-힣]*)${escapeRegExp(value)}([-A-Za-z가-힣]*|-[-0-9]*)$`, 'i');
            if (!reg.test(`${(_a = one.querySelector("routeName")) === null || _a === void 0 ? void 0 : _a.innerHTML}`)) {
                return;
            }
            if (((_b = one.querySelector("districtCd")) === null || _b === void 0 ? void 0 : _b.innerHTML) != "2") {
                return;
            }
            var exact = ((_c = one.querySelector("routeName")) === null || _c === void 0 ? void 0 : _c.innerHTML) === value;
            tmp += `<div><p class="routeItem" data-route-id=${(_d = one.querySelector("routeId")) === null || _d === void 0 ? void 0 : _d.innerHTML}>${exact ? "<b>" : ""}${(_e = one.querySelector("routeName")) === null || _e === void 0 ? void 0 : _e.innerHTML}${exact ? "</b>" : ""} (${(_f = one.querySelector("routeTypeName")) === null || _f === void 0 ? void 0 : _f.innerHTML}): ${(_g = one.querySelector("stStaNm")) === null || _g === void 0 ? void 0 : _g.innerHTML} → ${(_h = one.querySelector("edStaNm")) === null || _h === void 0 ? void 0 : _h.innerHTML}</p></div>`;
        });
    }
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("routeItem");
    for (const link of links) {
        link.addEventListener("click", routeStopList);
    }
};
const routeStopList = async (_, id) => {
    var _a, _b, _c, _d;
    const routeId = id || (_ === null || _ === void 0 ? void 0 : _.target).dataset.routeId || "";
    if (routeId === "")
        return;
    timetableBox.style.display = "none";
    prevLoc = window.location.hash = `#/route/${routeId}`;
    resultBox.innerHTML = "<p>Loading...</p>";
    const info = await gbis.info(routeId);
    const doc = await gbis.station(routeId);
    var tmp = ``;
    tmp += `<div id="routeInfo"><h2>${(_a = info.querySelector("routeName")) === null || _a === void 0 ? void 0 : _a.innerHTML} (${(_b = info.querySelector("routeTypeName")) === null || _b === void 0 ? void 0 : _b.innerHTML}): ${(_c = info.querySelector("startStationName")) === null || _c === void 0 ? void 0 : _c.innerHTML} → ${(_d = info.querySelector("endStationName")) === null || _d === void 0 ? void 0 : _d.innerHTML}</h2></div>`;
    const x = doc.querySelectorAll("busRouteStationList");
    x.forEach((one) => {
        var _a, _b, _c, _d, _e, _f;
        if (!resultBox)
            return;
        const mobileCode = (_a = one.querySelector("mobileNo")) === null || _a === void 0 ? void 0 : _a.innerHTML;
        tmp += `<div><p class="stopItem" data-route-id=${routeId} data-station-id=${(_b = one.querySelector("stationId")) === null || _b === void 0 ? void 0 : _b.innerHTML} data-station-seq=${(_c = one.querySelector("stationSeq")) === null || _c === void 0 ? void 0 : _c.innerHTML}>${(_d = one.querySelector("stationName")) === null || _d === void 0 ? void 0 : _d.innerHTML} ${mobileCode ? `(${mobileCode})` : ``} <a href="geo:${(_e = one.querySelector("y")) === null || _e === void 0 ? void 0 : _e.innerHTML},${(_f = one.querySelector("x")) === null || _f === void 0 ? void 0 : _f.innerHTML}">📍</a></p></div>`;
    });
    resultBox.innerHTML = tmp;
    var links = resultBox.getElementsByClassName("stopItem");
    for (const link of links) {
        link.addEventListener("click", routeStopHistory);
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
        routeStopList(_, routeId);
    }
    timetableBox.style.display = "flex";
    prevLoc = window.location.hash = `#/route/${routeId}`;
    window.location.hash = `#/history/${routeId}/${stationId}/${staOrder}/${sDay}`;
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
    mainBox.addEventListener("click", function closeTimetable(_) {
        timetableBox.style.display = "none";
        mainBox.removeEventListener("click", closeTimetable);
        window.location.hash = prevLoc;
    });
};
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
const initiator = async (_) => {
    var d = new Date();
    d.setTime(d.getTime() - 86400000);
    dateBox.setAttribute("max", `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    dateBox.setAttribute("value", `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    if (window.location.hash.startsWith("#/")) {
        var params = window.location.hash.split("/");
        if (params[1] === "search") {
            var value = params[2];
            keywordBox.value = value;
            await keywordSearch();
        }
        else if (params[1] === "route") {
            var value = params[2];
            await routeStopList(_, value);
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
            window.location.hash = "";
        }
    }
};
//window.addEventListener("hashchange", (_) => {
//    console.log(_.oldURL);
//    console.log(_.newURL);
//    initiator(_);
//});
(_a = document.querySelector("h1")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (_) => {
    window.location.hash = "";
    keywordBox.value = "";
    resultBox.innerHTML = "";
});
initiator();
