import { Input, Popover, Radio, Modal, message } from "antd";
import {
    ArrowDownOutlined,
    DownOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import { useSendTransaction, useWaitForTransaction } from "wagmi";
import { useEffect, useState } from "react";
import { apiRequest } from "@/server/apiRequest";

export default function Swap(props: { address: string }) {
    const { address } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const [slippage, setSlippage] = useState(2.5);
    const [tokenOneAmount, setTokenOneAmount] = useState<string | null>();
    const [tokenTwoAmount, setTokenTwoAmount] = useState<string | null>();
    const [tokenOne, setTokenOne] = useState(tokenList[0]);
    const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
    const [isOpen, setIsOpen] = useState(false);
    const [changeToken, setChangeToken] = useState(1);
    const [prices, setPrices] = useState<any>();
    const [txDetails, setTxDetails] = useState({
        to: null,
        data: null,
        value: null,
        gasPrice: null,
    });

    const { data, sendTransaction } = useSendTransaction();
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    function handleSlippageChange(e: any) {
        setSlippage(e.target.value);
    }

    function changeAmount(e: any) {
        setTokenOneAmount(e.target.value);
        if (e.target.value && prices) {
            const value = Number(e.target.value);
            setTokenTwoAmount((value * prices.ratio).toFixed(2));
        } else {
            setTokenTwoAmount(null);
        }
    }

    async function fetchPrices(one: string, two: string) {
        const prices = await apiRequest("/tokenPrice", {
            addressOne: one,
            addressTwo: two,
        });
        console.log("prices", prices);
        setPrices(prices);
    }

    function switchTokens() {
        setPrices(null);
        setTokenOneAmount(null);
        setTokenTwoAmount(null);
        const one = tokenOne;
        const two = tokenTwo;
        setTokenOne(two);
        setTokenTwo(one);
        fetchPrices(two.address, one.address);
    }

    function openModal(asset: any) {
        setChangeToken(asset);
        setIsOpen(true);
    }

    function modifyToken(i: any) {
        setPrices(null);
        setTokenOneAmount(null);
        setTokenTwoAmount(null);
        if (changeToken === 1) {
            setTokenOne(tokenList[i]);
            fetchPrices(tokenList[i].address, tokenTwo.address);
        } else {
            setTokenTwo(tokenList[i]);
            fetchPrices(tokenOne.address, tokenList[i].address);
        }
        setIsOpen(false);
    }
    async function fetchDexSwap() {
        const allowance = await apiRequest("/allowance", {
            walletAddress: address,
            tokenAddress: tokenOne.address,
        });

        if (allowance === "0") {
            const approve = await apiRequest("/approve", {
                walletAddress: address,
                tokenAddress: tokenOne.address,
            });
            console.log("approve", approve);
            setTxDetails({
                data: approve.data,
                to: approve.to,
                value: approve.value,
                gasPrice: approve.gasPrice,
            });
        }

        if (!tokenOneAmount) return;
        const tx = await apiRequest("/swap", {
            fromTokenAddress: tokenOne.address,
            toTokenAddress: tokenTwo.address,
            amount: String(Number(tokenOneAmount) * 10 ** tokenOne.decimals),
            fromAddress: address,
            slippage: slippage,
        });

        console.log("tx", tx);
        let decimals = Number(`1E${tokenTwo.decimals}`);
        setTokenTwoAmount(
            (Number(tx.toTokenAmount) / 10 ** decimals).toFixed(2)
        );
    }

    useEffect(() => {
        fetchPrices(tokenList[0].address, tokenList[1].address);
    }, []);

    useEffect(() => {
        if (
            txDetails.data &&
            txDetails.to &&
            txDetails.value !== null &&
            txDetails.gasPrice
        ) {
            sendTransaction({
                to: txDetails.to,
                data: txDetails.data,
                value: txDetails.value,
                gasPrice: txDetails.gasPrice,
            });
        }
    }, [txDetails]);

    useEffect(() => {
        messageApi.destroy();
        if (isLoading) {
            messageApi.open({
                type: "loading",
                content: "Transaction is Pending...",
                duration: 0,
            });
        }
    }, [isLoading]);

    useEffect(() => {
        messageApi.destroy();
        if (isSuccess) {
            messageApi.open({
                type: "success",
                content: "Transaction Successful",
                duration: 1.5,
            });
        } else if (txDetails.to) {
            messageApi.open({
                type: "error",
                content: "Transaction Failed",
                duration: 1.5,
            });
        }
    }, [isSuccess]);

    const settings = (
        <>
            <div>Slippage Tolerance</div>
            <div>
                <Radio.Group value={slippage} onChange={handleSlippageChange}>
                    <Radio.Button value={0.5}>0.5%</Radio.Button>
                    <Radio.Button value={2.5}>2.5%</Radio.Button>
                    <Radio.Button value={5}>5.0%</Radio.Button>
                </Radio.Group>
            </div>
        </>
    );

    return (
        <>
            {contextHolder}

            <Modal
                open={isOpen}
                footer={null}
                onCancel={() => setIsOpen(false)}
                title="Select a token"
            >
                <div className="modalContent">
                    {tokenList?.map((e, i) => {
                        return (
                            <div
                                className="tokenChoice"
                                key={i}
                                onClick={() => modifyToken(i)}
                            >
                                <img
                                    src={e.img}
                                    alt={e.ticker}
                                    className="tokenLogo"
                                />
                                <div className="tokenChoiceNames">
                                    <div className="tokenName">{e.name}</div>
                                    <div className="tokenTicker">
                                        {e.ticker}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal>
            <div className="tradeBox">
                <div className="tradeBoxHeader">
                    <h4>Swap</h4>
                    <Popover
                        content={settings}
                        title="Settings"
                        trigger="click"
                        placement="bottomRight"
                    >
                        <SettingOutlined className="cog" />
                    </Popover>
                </div>
                <div className="inputs">
                    <Input
                        placeholder="0"
                        value={tokenOneAmount as string}
                        onChange={changeAmount}
                        disabled={!prices}
                    />
                    <Input
                        placeholder="0"
                        value={tokenTwoAmount as string}
                        disabled={true}
                    />
                    <div className="switchButton" onClick={switchTokens}>
                        <ArrowDownOutlined className="switchArrow" />
                    </div>
                    <div className="assetOne" onClick={() => openModal(1)}>
                        <img
                            src={tokenOne.img}
                            alt="assetOneLogo"
                            className="assetLogo"
                        />
                        {tokenOne.ticker}
                        <DownOutlined />
                    </div>
                    <div className="assetTwo" onClick={() => openModal(2)}>
                        <img
                            src={tokenTwo.img}
                            alt="assetOneLogo"
                            className="assetLogo"
                        />
                        {tokenTwo.ticker}
                        <DownOutlined />
                    </div>
                </div>
                <button
                    className="swapButton"
                    disabled={!tokenOneAmount}
                    onClick={fetchDexSwap}
                >
                    Swap
                </button>
            </div>
        </>
    );
}
