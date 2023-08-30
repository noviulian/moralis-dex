import { inchApiRequest } from "@/server/inchApiRequest";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await new Promise((resolve) => setTimeout(resolve, 1050));

    const { tokenAddress } = req.query;

    if (!tokenAddress) {
        res.status(400).json({ error: "Missing token address" });
        return;
    }

    const data = await inchApiRequest("/approve/transaction", {
        tokenAddress: tokenAddress,
    }).catch((error) => {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    });

    res.status(200).json(data);
}
