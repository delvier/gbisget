const url = "https://api.gbis.go.kr/ws/rest/";
const k = "1234567890";
export async function main(keyword, serviceKey = k) {
    const res = await fetch(`${url}busrouteservice?serviceKey=${serviceKey}&keyword=${keyword}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}
export async function info(routeId, serviceKey = k) {
    const res = await fetch(`${url}busrouteservice/info?serviceKey=${serviceKey}&routeId=${routeId}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}
export async function station(routeId, serviceKey = k) {
    const res = await fetch(`${url}busrouteservice/station?serviceKey=${serviceKey}&routeId=${routeId}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}
export async function pastarrival(date, routeId, stationId, staOrder, serviceKey = k) {
    const res = await fetch(`${url}pastarrivalservice/xml?serviceKey=${serviceKey}&sDay=${date}&routeId=${routeId}&stationId=${stationId}&staOrder=${staOrder}`)
        .then(res => res.text())
        .then(text => new DOMParser().parseFromString(text, "text/xml"));
    return res;
}
