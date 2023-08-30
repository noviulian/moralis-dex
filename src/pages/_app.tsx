import type { AppProps } from "next/app";
import { createConfig, configureChains, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { SessionProvider } from "next-auth/react";
import { mainnet, polygon, bsc } from "wagmi/chains";

import "../styles/App.css";
import "../styles/index.css";
const { publicClient, webSocketPublicClient } = configureChains(
    [mainnet, polygon, bsc],
    [publicProvider()]
);

const config = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
});

function App({ Component, pageProps }: AppProps) {
    return (
        <WagmiConfig config={config}>
            <SessionProvider session={pageProps.session} refetchInterval={0}>
                <Component {...pageProps} />
            </SessionProvider>
        </WagmiConfig>
    );
}

export default App;
