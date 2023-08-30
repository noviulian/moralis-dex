import Moralis from "moralis";
import { EvmAddress } from "moralis/common-evm-utils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!Moralis.Core.isStarted) {
        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY,
        });
    }

    const { addressOne, addressTwo } = req.query;

    const one = EvmAddress.create(addressOne as string);
    const two = EvmAddress.create(addressTwo as string);
    if (!addressOne || !addressTwo) {
        res.status(400).json({ error: "Missing address" });
        return;
    }

    const responseOne = await Moralis.EvmApi.token.getTokenPrice({
        address: one,
    });

    const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
        address: two,
    });

    const usdPrices = {
        tokenOne: responseOne.raw.usdPrice,
        tokenTwo: responseTwo.raw.usdPrice,
        ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice,
    };

    res.status(200).json(usdPrices);
}
