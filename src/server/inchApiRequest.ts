import axios from "axios";

const chainId = process.env.CHAIN;
const baseUrl = "https://api.1inch.dev/swap/v5.2/" + chainId;
const oneInchAPIkey = process.env.ONEINCH_API_KEY;

if (!oneInchAPIkey) {
    throw new Error("Missing 1inch API key");
}

const headers = {
    Authorization: `Bearer ${oneInchAPIkey}`,
    accept: "application/json",
};

function requestURL(methodName: string, queryParams: Record<string, any>) {
    return (
        baseUrl + methodName + "?" + new URLSearchParams(queryParams).toString()
    );
}

export async function inchApiRequest(
    path: string,
    queryParams: Record<string, any>
) {
    const url = requestURL(path, queryParams);
    const { data } = await axios.get(url, { headers });
    return data;
}
