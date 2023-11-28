const url: String = "https://api.gbis.go.kr/ws/rest/";
const k: String = "1234567890";

export async function routeMain(keyword: String, serviceKey: String = k) {
    const res = await fetch(`${url}busrouteservice?serviceKey=${serviceKey}&keyword=${keyword}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}

export async function routeInfo(routeId: String, serviceKey: String = k) {
    const res = await fetch(`${url}busrouteservice/info?serviceKey=${serviceKey}&routeId=${routeId}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}

export async function routeStation(routeId: String, serviceKey: String = k) {
    const res = await fetch(`${url}busrouteservice/station?serviceKey=${serviceKey}&routeId=${routeId}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}

export async function stationMain(keyword: String, serviceKey: String = k) {
    const res = await fetch(`${url}busstationservice?serviceKey=${serviceKey}&keyword=${keyword}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}

export async function stationInfo(stationId: String, serviceKey: String = k) {
    const res = await fetch(`${url}busstationservice/info?serviceKey=${serviceKey}&stationId=${stationId}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}

export async function stationRoute(stationId: String, serviceKey: String = k) {
    const res = await fetch(`${url}busstationservice/route?serviceKey=${serviceKey}&stationId=${stationId}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}

export async function pastarrival(date: String, routeId: String, stationId: String, staOrder: String, serviceKey: String = k) {
    const res = await fetch(`${url}pastarrivalservice/xml?serviceKey=${serviceKey}&sDay=${date}&routeId=${routeId}&stationId=${stationId}&staOrder=${staOrder}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}