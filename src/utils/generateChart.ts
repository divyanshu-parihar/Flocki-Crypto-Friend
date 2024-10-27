import axios from "axios";
import QuickChart from "quickchart-js";

export async function generateLineChart(token: string, timeframe: string): Promise<string | null> {
    try {
        const response = await axios.get(`https://api.mexc.in/api/v3/klines?symbol=${token}&interval=${timeframe}`);
        const data: Array<Array<string | number>> = response.data; // This should be an array of kline data

        // Prepare data for line chart
        const labels = data.map(item => new Date(item[0] as number).toLocaleTimeString()); // Extracting time labels
        const closingPrices = data.map(item => parseFloat(item[4] as string)); // Extracting closing prices

        // console.log(closingPrices)
        // Create a line chart configuration
        const myChart = new QuickChart();
        // myChart.setWidth(800); // Set width as needed
        // myChart.setHeight(400); // Set height as needed
        // myChart.setVersion('2');
        myChart.setConfig({
            type: 'line',
            data: {
                labels: labels.slice(-200),
                datasets: [{
                    label: token, // Use the token name for the label
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    data: closingPrices.slice(-200), // Use the closing prices directly
                    fill: false, // Do not fill under the line
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price',
                        },
                    },
                },
            },
        });

        // Get the chart URL
        const url =  myChart.getUrl();
        console.log(url)
        return url;
    } catch (error) {
        console.error('Error generating chart:', error);
        return null;
    }
}



export async function generateCandleStickChart(token: string, timeframe: string): Promise<string | null> {
    try {
        const response = await axios.get(`https://api.mexc.in/api/v3/klines?symbol=${token}&interval=${timeframe}`);
        const data: Array<Array<string | number>> = response.data; // This should be an array of kline data

        // Prepare data for line chart

        // Create a line chart configuration
        const myChart = new QuickChart();
        const formattedData = data.map(item => ({
            x: item[0], // Open time
            o: parseFloat(item[1] as string), // Open price
            h: parseFloat(item[2] as string), // High price
            l: parseFloat(item[3] as string), // Low price
            c: parseFloat(item[4] as string), // Close price
        }));

        // myChart.setWidth(800); // Set width as needed
        // myChart.setHeight(400); // Set height as needed
        myChart.setVersion('3');


        // console.log(formattedData)
        myChart.setConfig({

            type: 'candlestick',
            data: {
                // labels: labels.slice(-200),
                datasets: [
                    {
                        data: formattedData.slice(-100)
                    },
                ],
            },
            options: {
                scales:{
                    x:{
                        adapters: {
                            date: {
                                zone: 'UTC-4'
                            }
                        },
                        time: {
                            displayFormats: {
                                day: 'MMM d',
                                month: 'MMM d',
                            }
                        },
                        ticks: {
                            autoSkip: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        });

        // Get the chart URL
        return myChart.getUrl();
    } catch (error) {
        console.error('Error generating chart:', error);
        return null;
    }
}

