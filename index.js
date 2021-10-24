const {Fetcher, ChainId, WETH, Route, TradeType, TokenAmount, Trade, Percent} = require('@uniswap/sdk');
const { ethers } = require('ethers');

const chainId = ChainId.MAINNET; 
const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

const init = async() => {
    const dai = await Fetcher.fetchTokenData(chainId, tokenAddress);
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(dai,weth);
    const route = new Route([pair], weth);
    const trade = new Trade(route, new TokenAmount(weth, '100000000000000000'), TradeType.EXACT_INPUT)
    console.log(route.midPrice.toSignificant(6)); 
    console.log(route.midPrice.invert().toSignificant(6)); 
    console.log(trade.nextMidPrice.toSignificant(6)); 

    const slippageTolerance = new Percent('50', '10000')
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const to = '';
    const deadLine = Math.floor(Date.now()/ 1000) + 60 *20; 
    const value = trade.inputAmount.raw; 

    const provider = ethers.getDefaultProvider('mainnet', {
        infura: ''
    }); 

    const signer = new ethers.Wallet(PRIVATE_KEY);
    const account = signer.connect(provider)
    const uniswap = new ethers.Contract(
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
        ['function swapExactETHForTokens(unit amountOutMin, address[] calldata path, address to, unit deadline) external payable return(unit[] memory amount)'],
        account
    )

    const tx = await uniswap.sendExactETHForTokens(
        amountOutMin, 
        path, 
        to, 
        deadline, 
        {value, gasPrice: 20e9}
    ); 
    console.log('Transaction hash: %{tx.hash}'); 

    const receipt = await tx.wait(); 
    console.log(`Transaction was mined in block ${receipt.blockNumber}`)



}

init();