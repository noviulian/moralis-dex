import { inchApiRequest } from "@/server/inchApiRequest";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await new Promise((resolve) => setTimeout(resolve, 1050));

    const { fromTokenAddress, toTokenAddress, amount, fromAddress, slippage } =
        req.query;

    console.log({
        fromTokenAddress,
        toTokenAddress,
        amount,
        fromAddress,
        slippage,
    });
    if (!fromTokenAddress || !toTokenAddress) {
        res.status(400).json({ error: "Missing token address" });
        return;
    }

    const data = await inchApiRequest("/swap", {
        src: fromTokenAddress,
        dst: toTokenAddress,
        amount: String(amount),
        fromAddress: fromAddress,
        slippage: String(slippage),
    }).catch((error) => {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
        return;
    });

    return res.status(200).json(data);
}
