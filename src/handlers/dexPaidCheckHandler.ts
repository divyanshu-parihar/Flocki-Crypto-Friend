import { Context } from "telegraf";
import axios from 'axios';
interface DexScreenerResponse {
    pairs: Array<{
        chainId: string;
        dexId: string;
        url: string;
        pairAddress: string;
        labels: string[];
        baseToken: {
            address: string;
            name: string;
            symbol: string;
        };
        quoteToken: {
            symbol: string;
        };
        priceNative: string;
        priceUsd: string;
        txns: {
            h24: {
                buys: number;
                sells: number;
            };
        };
        volume: {
            h24: number;
        };
        priceChange: {
            h24: number;
        };
        liquidity?: {
            usd: number;
        };
        fdv?: number;
    }>;
}

async function checkDexScreenerStatus(address: string): Promise<{ isPaid: boolean; message: string; url?: string }> {
    try {
        const response = await axios.get<DexScreenerResponse>(
            `https://api.dexscreener.com/latest/dex/tokens/${address}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            }
        );

        const pairs = response.data.pairs;

        if (!pairs || pairs.length === 0) {
            return {
                isPaid: false,
                message: "⚠️ No pairs found for this token"
            };
        }

        return {
            isPaid: false,
            message: '',
            // url: dexScreenerUrl
        };

    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
                return {
                    isPaid: false,
                    message: "⚠️ Rate limit exceeded. Please try again later."
                };
            }
            if (error.response?.status === 403) {
                return {
                    isPaid: true,
                    message: "🔒 This token is premium (403 Forbidden response)"
                };
            }
        }

        return {
            isPaid: false,
            message: `❌ Error checking DEXScreener status: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

export async function dexPaidCheckHandler(ctx: Context) {
    try {
        const args = ctx.text?.split(' ').slice(1) || [];
        const token = args[0] || '0xc00e94cb662c3520282e6f5717214004a7f26888';

        // Send initial status message
        const statusMsg = await ctx.reply('🔍 Checking DEXScreener status...');

        // Check DEXScreener status
        const result = await checkDexScreenerStatus(token);

        // Update status message with token information

        if(result.isPaid){
            await ctx.telegram.editMessageText(
                ctx.chat?.id,
                statusMsg.message_id,
                undefined,
                'Dex Screener is Paid.'
            );
        }else{
            await ctx.telegram.editMessageText(
                ctx.chat?.id,
                statusMsg.message_id,
                undefined,
                'Dex Screener is not Paid.'
            );
        }


        // If we have a URL and the token has data, take a screenshot


    } catch (error) {
        console.error('Handler error:', error);
        await ctx.reply('❌ An error occurred while processing your request.');
    }
}