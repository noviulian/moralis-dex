export async function apiRequest(path: string, params: any) {
    const paramsString = new URLSearchParams(params).toString();
    const url = "/api/swap/" + path + "?" + paramsString;

    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
    return data;
}
