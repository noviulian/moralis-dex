import Head from "next/head";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { getSession, signIn } from "next-auth/react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { useRouter } from "next/router";
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";
import Header from "@/components/Header";
import { useState } from "react";
import Swap from "@/components/Swap";
export default function Home({ user }: any) {
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { requestChallengeAsync } = useAuthRequestChallengeEvm();

    const [userAddress, setUserAddress] = useState("");
    async function handleAuth() {
        if (isConnected) {
            await disconnectAsync();
        }

        const { account, chain } = await connectAsync({
            connector: new MetaMaskConnector(),
        });

        setUserAddress(account);

        const challengeResponse = await requestChallengeAsync({
            address: account,
            chainId: chain.id,
        });

        if (!challengeResponse) {
            throw new Error("No challenge response");
        }
        const { message } = challengeResponse;

        const signature = await signMessageAsync({ message });

        if (!signature) {
            throw new Error("No signature");
        }

        try {
            await signIn("moralis-auth", {
                message,
                signature,
                redirect: false,
            });
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <>
            <Head>
                <title>Moralis Dex</title>
                <meta
                    name="description"
                    content="Created by the Moralis Team"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/moralis-logo.svg" />
            </Head>

            <Header connect={handleAuth} user={user} />
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Swap address={user.address} />
            </div>
        </>
    );
}

export async function getServerSideProps(context: any) {
    const session = await getSession(context);
    console.log(session?.user);
    // redirect if not authenticated
    if (!session) {
        return {
            props: { user: null },
        };
    }

    return {
        props: { user: session.user },
    };
}
