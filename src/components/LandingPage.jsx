import humanNumber from 'human-number';
import React, { useEffect, useState } from 'react'
import { Button, Spinner, Table } from 'react-bootstrap';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
		align-items: center;
    font-size: 14px;
    th{
        font-size: 0.9rem;
        background: rgb(250, 250, 250) !important;
        border-left: none !important;
        font-weight: 500 !important;
        color: rgba(0, 0, 0, 0.6) !important;
        text-align: end;
    }
    td{
        text-align: end;
    }
    tbody{
        background: #fff;
    }
    .negative{
        color: rgb(244, 67, 54);
    }
    .positive{
        color: rgb(24, 198, 131);
    }
    img{
        width: 30px;
        height: 30px;
        margin-right: 0.5em;
    }
    .symbol{
        margin-bottom: 0;
        font-size: 0.8em;
        opacity: 0.7;
        text-align: start;
    }
    .spinner-div{
        display: flex;
        justify-content: center;
        height: 100vh;
        align-items: center;
    }
    table{
        /* width: 80%; */
				/* position: absolute; */
        margin-top: 7rem;
        margin-bottom: 2rem;
        box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 15px -3px !important;
    }
    .market-data{
        background: linear-gradient(to right, rgb(63, 81, 181), rgb(100, 181, 246)) rgb(255, 255, 255) !important;
        border: none !important;
        padding-bottom: 10em !important;
				width: 100%;
    }
		.label{
			font-family: Lato,Helvetica Neue,Arial,Helvetica,sans-serif;
			font-size: 1em;
			font-weight: 700;
			color: #fff;
			text-transform: uppercase;
			text-align: center;
		}
		.value{
			font-size: 1.5rem;
			font-weight: 400;
			color: #fff;
			text-align: center;
		}
`

const LandingPage = () => {
	const [coinsData, setCoinsData] = useState([]);
	const [marketData, setMarketData] = useState([])
	console.log('marketData: ', marketData);
	const [isLoading, setIsLoading] = useState(true);
	const [visibleItems, setVisibleItems] = useState(50);

	useEffect(() => {
		fetchCoinsData()
	}, [])

	const handleViewMore = () => {
		setVisibleItems((prevVisibleItems) => prevVisibleItems + 50);
	};

	const fetchCoinsData = () => {
		const graphqlQuery = `
        {
            marketTotal {
                marketCapUsd
                exchangeVolumeUsd24Hr
                assets
                exchanges
                markets
                __typename
            }
        }
        `;
		fetch('https://api.coincap.io/v2/assets')
			.then(response => response.json())
			.then(data => {
				setCoinsData(data.data)
				setIsLoading(false)
			})
			.catch(error => console.log(error))

		fetch('https://graphql.coincap.io/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query: graphqlQuery })
		})
			.then(response => response.json())
			.then(data => setMarketData(data.data.marketTotal))
			.catch(error => console.log(error));
	}

	return (
		<Wrapper>
			{
				isLoading ? (
					<div className='spinner-div'>
						<Spinner animation="border" role="status">
							<span className="visually-hidden">Loading...</span>
						</Spinner>
					</div>
				) : (
					<>
						<div className='market-data'>
							<div className='d-flex justify-content-around pt-4'>
								<div>
									<div className="label">Market Cap </div>
									<div className="value"><span>{`$${humanNumber(marketData?.marketCapUsd, n => Number.parseFloat(n).toFixed(2))}`}</span>
									</div>
								</div>
								<div>
									<div className="label">Exchange vol </div>
									<div className="value"><span>{`$${humanNumber(marketData?.exchangeVolumeUsd24Hr, n => Number.parseFloat(n).toFixed(2))}`}</span>
									</div>
								</div>
								<div>
									<div className="label">Assets</div>
									<div className="value"><span>{marketData.assets}</span>
									</div>
								</div>
								<div>
									<div className="label">Exchanges</div>
									<div className="value"><span>{marketData.exchanges}</span>
									</div>
								</div>
								<div>
									<div className="label">Markets</div>
									<div className="value"><span>{marketData.markets}</span>
									</div>
								</div>
							</div>
						</div>
						<div className='position-absolute' style={{width: '90%'}}>
							<Table>
								<thead>
									<tr>
										<th className='text-center'>Rank</th>
										<th className='text-start'>Name</th>
										<th>Price</th>
										<th>Market Cap</th>
										<th>VWAP (24Hr)</th>
										<th>Supply</th>
										<th>Volume (24Hr)</th>
										<th>Change (24Hr)</th>
									</tr>
								</thead>
								<tbody>
									{
										coinsData?.slice(0, visibleItems)?.map((item, index) => {
											const changePercent = parseFloat(item?.changePercent24Hr);
											const formattedChangePercent = changePercent?.toFixed(2);
											const className = changePercent < 0 ? 'negative' : 'positive';
											return (
												<tr key={item.id}>
													<td className='text-center'>{item.rank}</td>
													<td>
														<div className='d-flex'>
															<div className='d-flex align-items-center'>
																<img src={`https://assets.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png`} alt={item.name} />
															</div>
															<div>
																<p className='mb-0'>{item.name}</p>
																<p className='symbol'>{item.symbol}</p>
															</div>
														</div>
													</td>
													<td>{`$${parseFloat(item?.priceUsd)?.toFixed(2)}`}</td>
													<td>{`$${humanNumber(item?.marketCapUsd, n => Number.parseFloat(n).toFixed(2))}`}</td>
													<td>{`$${parseFloat(item?.vwap24Hr)?.toFixed(2)}`}</td>
													<td>{`${humanNumber(item?.supply, n => Number.parseFloat(n).toFixed(2))}`}</td>
													<td>{`$${humanNumber(item?.volumeUsd24Hr, n => Number.parseFloat(n).toFixed(2))}`}</td>
													<td className={className}>{`${formattedChangePercent}%`}</td>
												</tr>
											)
										})
									}
								</tbody>
							</Table>
							{visibleItems < coinsData.length && (
								<div className='d-flex justify-content-center mb-5'>
									<Button variant="success" onClick={handleViewMore}>
										View More
									</Button>
								</div>
							)}
						</div>
					</>
				)
			}
		</Wrapper>
	)
}

export default LandingPage;