import { inchApiRequest } from "@/server/inchApiRequest";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // wait 1.05 seconds

    await new Promise((resolve) => setTimeout(resolve, 1050));
    const { tokenAddress, walletAddress } = req.query;

    console.log("hello", tokenAddress, walletAddress);
    if (!tokenAddress || !walletAddress) {
        res.status(400).json({ error: "Missing address" });
        return;
    }

    const data = await inchApiRequest("/approve/allowance", {
        tokenAddress: tokenAddress,
        walletAddress: walletAddress,
        amount: "0x8000000000000000000000000000000000000000000000000000000000000000",
    }).catch((error) => {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    });

    res.status(200).json(data);
}
