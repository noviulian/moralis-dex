import { getSession } from "next-auth/react";
import Link from "next/link";

type HeaderProps = {
    connect: () => void;
    user: any;
};
const Header = (props: HeaderProps) => {
    const { connect, user } = props;
    return (
        <header>
            <div className="leftH">
                <img src="/moralis-logo.svg" alt="logo" className="logo" />
                <Link href="/" className="link">
                    <div className="headerItem">Swap</div>
                </Link>
                <Link href="/tokens" className="link">
                    <div className="headerItem">Tokens</div>
                </Link>
            </div>
            <div className="rightH">
                <div className="headerItem">
                    <img src="/eth.svg" alt="eth" className="eth" />
                    Ethereum
                </div>
                <div className="connectButton" onClick={connect}>
                    {user
                        ? user.address.slice(0, 4) +
                          "..." +
                          user.address.slice(38)
                        : "Connect"}
                </div>
            </div>
        </header>
    );
};

export default Header;
