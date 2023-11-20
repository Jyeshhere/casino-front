'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import { title } from "@/components/primitives";
import {User, Chip, Tooltip, ChipProps, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, getKeyValue, Tabs, Tab, Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Button as NextButton, Snippet, Avatar as NextAvatar} from "@nextui-org/react";
import { InputNumber, Button, message, Spin, Result, Radio, Tag, Popover, Avatar, Space } from 'antd';
import { useTheme } from "next-themes";
import { useCookies } from 'react-cookie';
import { FaUserAstronaut, FaDice } from "react-icons/fa";
import { HiOutlineLogin } from "react-icons/hi";
import { siteConfig } from "@/config/site";
import axios from 'axios';
import { generateSeed } from "@/modules/utils";
import blake from 'blakejs';
import { CopyOutlined, InfoCircleOutlined, SmileOutlined, FrownOutlined, MehOutlined, EuroOutlined, BankOutlined } from '@ant-design/icons';
import "@/styles/emojis.css";
import "@/styles/general.css";
import io from 'socket.io-client';
const socket = io(`${siteConfig.apiUrl}`);
const options = [
	{ value: "xno", label: 'XNO', logo: 'https://xno.nano.org/images/xno-badge-blue.svg' },
	{ value: "ban", label: 'BAN', logo: 'https://banano.cc/presskit/banano-icon.svg' },
	{ value: "ana", label: 'ANA', logo: 'https://nanswap.com/logo/ANA.png' },
	{ value: "xdg", label: 'XDG', logo: 'https://dogenano.io/static/media/XDG.00462477.png' },
  ];

  
export default function PricingPage() {
	const { theme, setTheme } = useTheme();
	const [cookies, setCookie, removeCookie] = useCookies(['token', 'currency']);
	const isAuthenticated = !!cookies.token;
	const [amount, setAmount] = useState<number | null>(null);
	const [selectedOption, setSelectedOption] = useState(1);
	const [loadingStatus, setLoading] = useState(false);
	const [selectedSign, setSelectedSign] = useState(1);
	const [opponentSign, setOpponentSign] = useState(false);
	const [allJson, setAllJson] = useState<{ status: string, hash: string } | null>(null);
	const [emojiRain, setEmojiRain] = useState<string[]>([]);
	const [maxAmount, setMaxAmount] = useState<number>(0);
	
	const [balanceData, setBalanceData] = useState(null);
	const [theLogo, setTheLogo] = useState<string | null>(null);
	const [email, setEmail] = useState('');

	interface LatestBet {
		// Définissez ici les propriétés de votre objet LatestBet
		// Par exemple :
		user: string;
		status: string;
		amount: number;
		// ... autres propriétés
	  }
	  
	const [latestBets, setLatestBets] = useState<LatestBet[]>([]);

	socket.on('balances', (data) => {
		const emailHash = blake.blake2bHex(email);
		if (data.email) {
		  if (data.email === emailHash) {
			const withoutEmail = { ...data };
			delete withoutEmail.email;
			setBalanceData(withoutEmail);
		  }
		} else {
		  setBalanceData(data);
		}
	});

	// Requête axios pour récupérer des informations du user...
	useEffect(() => {
		axios.get(`${siteConfig.apiUrl}/user/email`, {
			headers: {
			  auth: cookies.token
			}
		  })
		  .then(response => {
			if (response.data && response.data.email) {
			  setEmail(response.data.email);
			}
		  })
		  .catch(error => {
			console.error('Error fetching email:', error);
		  })
	}, [isAuthenticated, cookies.token]);

	type User = any
	const renderCell = useCallback((user: User, columnKey: React.Key) => {
		const statusColorMap: Record<string, ChipProps["color"]>  = {
			win: "success",
			lose: "danger",
			egal: "warning",
		  };
		const cellValue = user[columnKey as keyof User];
	
		switch (columnKey) {
		  case "user":
			return (
				<Image src={`https://robohash.org/${user.user}?set=set4`} radius='none' width="40px" alt='User Avatar'/>
			);
		  case "role":
			return (
			  <div className="flex flex-col">
				<p className="text-bold text-sm capitalize">{cellValue}</p>
				<p className="text-bold text-sm capitalize text-default-400">{user.team}</p>
			  </div>
			);
		  case "status":
			return (
			  <Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
				{cellValue}
			  </Chip>
			);
		  case "amount":
			return (
				<Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
					{String(user.amount).substring(0, 15)}
				</Chip>
			);
		  case "currency":
			const currencyOption = options.find((option) => option.value === user.currency);
			if (currencyOption) {
			return (
				<Image
                    src={currencyOption.logo}
                    alt={currencyOption.label}
                	style={{ width: '24px', marginRight: '8px' }}
                />
			);
			} else {
				return user.currency;
			}
		  case "actions":
			return (
			  <div className="relative flex items-center gap-2">
				<Tooltip content="Details">
				  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
					<SmileOutlined />
				  </span>
				</Tooltip>
				<Tooltip content="Edit user">
				  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
					<SmileOutlined />
				  </span>
				</Tooltip>
				<Tooltip color="danger" content="Delete user">
				  <span className="text-lg text-danger cursor-pointer active:opacity-50">
					<SmileOutlined />
				  </span>
				</Tooltip>
			  </div>
			);
		  default:
			return cellValue;
		}
	  }, []);

	const [page, setPage] = React.useState(1);
  	const rowsPerPage = 10;

	  const pages = Math.ceil(latestBets.length / rowsPerPage);

	  const items = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;
	
		return latestBets.slice(start, end);
	}, [page, latestBets]);

	const sortLatestBets = (bets: any[]) => {
		return bets.sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
	};

	const emojisDefault: string[] = ['🌟', '❤️', '🎉', '🍀', '🌈', '🚀', '🌸', '🌺', '🌻', '🌼'];
	const emojisWin: string[] = ['🎉', '🏆', '🥇', '🌟'];
	const emojisLose: string[] = ['😭', '💔', '😢', '🙁'];
	const emojisEqual: string[] = ['💁', '🤝', '🙆', '🤷'];
	  
	
	  socket.on('pfchistory', (data) => {
		addNewEntryToLatestBets(data);
		
	  });

	  const addNewEntryToLatestBets = (newEntry: any) => {
		const updatedLatestBets = [...latestBets];
	  
		// Ajoutez la nouvelle entrée au début du tableau (vous pouvez également la placer où vous le souhaitez)
		updatedLatestBets.unshift(newEntry);
	  
		// Mettez à jour le state avec le nouveau tableau
		setLatestBets(updatedLatestBets);
	  };
	
	  useEffect(() => {
		const fetchLatestBets = async () => {
			try {
			  const response = await axios.get(`${siteConfig.apiUrl}/history/pfc`);
			  const sortedBets = sortLatestBets(response.data);
			  setLatestBets(sortedBets);
			} catch (error) {
			  console.error('Error fetching latest bets:', error);
			}
		  };	
		fetchLatestBets();
	  }, []);

	const getResultText = (status: any) => {
		if (status) {
			if (status === 'win') return `You win: x2`;
			if (status === 'lose') return `You lose: x0`;
			if (status === 'egal') return `Egal: x1`;
		} else {
			return 'Inconnu';
		}
	  };
	
	  const getResultIcon = (status: any) => {
		if (status) {
		  if (status === 'win') return <SmileOutlined />;
		  if (status === 'lose') return <FrownOutlined />;
		  if (status === 'egal') return <MehOutlined />;
		} else {
			return <InfoCircleOutlined />;
		}
	  };


	const handlePlay = () => {
		if (amount === null) {
		  message.error('Veuillez sélectionner un signe et entrer un montant valide.');
		  return;
		}
	
		if (selectedOption === -1) {
		  message.error('Veuillez sélectionner une option avant de jouer.');
		  return;
		}
	
		setLoading(true);
		const Seed = generateSeed();
		const data = {
		  signe: selectedSign,
		  amount: amount,
		  currency: cookies.currency ? cookies.currency : "xno",
		  gameSeed: Seed
		};
	
		axios
		  .post(`${siteConfig.apiUrl}/game/pfc`, data, {
			headers: {
			  'Content-Type': 'application/json',
			  auth: cookies.token,
			},
		  })
		  .then((response) => {
			setOpponentSign(true);
			setLoading(false);
			setAllJson(response.data);
			if (response.data.status === 'win') {
			  setEmojiRain(emojisWin);
			} else if (response.data.status === 'lose') {
			  setEmojiRain(emojisLose);
			} else if (response.data.status === 'egal') {
			  setEmojiRain(emojisEqual);
			}
	
			//message.success('Jeu terminé. Résultat : ' + getResultText(response.data));
			const updateBalances = async () => {
				try {
				  const response = await axios.get(`${siteConfig.apiUrl}/user/balances`, {
					headers: {
					  auth: cookies.token,
					},
				  });
				  setBalanceData(response.data);
			
				} catch (error) {
				  console.error('Error fetching balance:', error);
				}
			};
			// Mettez à jour les soldes après avoir reçu le résultat du pari
			updateBalances();
		  })
		  .catch((error) => {
			setLoading(false);
			message.error('Une erreur s\'est produite lors du jeu : ' + error.message);
		  });
	};

	const handleDivideByTwo = () => {
		if (amount !== null) {
		  setAmount(amount / 2);
		}
	  };
	  
	const handleMultiplyByTwo = () => {
		if (amount !== null && amount * 2 <= maxAmount) {
		  setAmount(amount * 2);
		}
	};
	
	const handleSetToMax = () => {
		setAmount(maxAmount);
	};

	function getTicketLogo(ticketCode: string) {
		const ticket = options.find(option => option.value === ticketCode);
		if (ticket) {
		  return ticket.logo;
		} else {
		  return null; // Ticket non trouvé
		}
	}

	useEffect(() => {
		const logoUrl = getTicketLogo(cookies.currency);
		setTheLogo(logoUrl);
	  }, [cookies.currency]);

	useEffect(() => {
		if (balanceData) {
		  const selectedCrypto = options.find((option) => option.value === cookies.currency);
		  
			axios.get(`${siteConfig.apiUrl}/infos/maxBet`, {
			  headers: {
				auth: cookies.token,
			  },
			})
			  .then(response => {
				if (response.data) {
				  if (balanceData[selectedCrypto ? selectedCrypto.value : "xno"] >= response.data[selectedCrypto ? selectedCrypto.value : "XNO"]) {
					setMaxAmount(response.data[selectedCrypto ? selectedCrypto.value : "xno"]);
				  } else {
					setMaxAmount(balanceData[selectedCrypto ? selectedCrypto.value : "xno"]);
				  }
				}
			  })
			  .catch(error => {
				console.error('Error fetching login history:', error);
			  });
			
		  
		}
	  }, [selectedOption, balanceData, cookies.currency, cookies.token]);

	useEffect(() => {
		const updateBalances = async () => {
			try {
			  const response = await axios.get(`${siteConfig.apiUrl}/user/balances`, {
				headers: {
				  auth: cookies.token,
				},
			  });
			  setBalanceData(response.data);
		
			} catch (error) {
			  console.error('Error fetching balance:', error);
			}
		};
		updateBalances();
	}, [cookies.token, cookies.currency]);
	return (
		<>
		
		{loadingStatus ? (
			<Spin size="large" tip="Chargement ..." />
		) : opponentSign ? (
			<>
        <div className="emoji-rain-container">
		{emojiRain.map((emoji, index) => (
			<div
				className="emoji-raindrop"
				key={index}
				style={{
				left: `${Math.random() * 80}vw`, // Limit left positioning to 80% of viewport width
				top: `${Math.random() * 80}vh`, // Limit top positioning to 80% of viewport height
				fontSize: `${Math.random() * 2 + 1}em`, // Adjust the font size as needed
				opacity: 0.7, // Adjust the opacity as needed
				animationDuration: `${2 + Math.random() * 3}s`,
				}}
			>
				{emoji}
			</div>
		))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Result
            icon={getResultIcon(allJson?.status)}
            title={<p style={{ color: theme === "light" ? "black" : "#FFFFFF" }}>{getResultText(allJson?.status)}</p>}
            style={{
              textAlign: 'center',
              color: theme === "light" ? "black" : "#FFFFFF",
            }}
            subTitle={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Snippet symbol="#" variant="bordered">
					{allJson === null ? "error" : allJson.hash.substring(0, 8)}
                </Snippet>
              </div>
            }
            extra={[
              <NextButton
				key="rejouer"
                color="primary"
                onClick={() => {
                  setOpponentSign(false);
                  setEmojiRain([]);
                }}
                disabled={!isAuthenticated}
              >
                REJOUER
              </NextButton>,
            ]}
          />
        </div>
      </>
		) : (
		<>
			<Card className="max-w-[400px]">
						<CardHeader className="flex gap-3">
							<div className="flex flex-col">
								<p className="text-md">Jeu Pierre-Papier-Ciseaux</p>
							</div>
						</CardHeader>
						<Divider />
						<CardBody style={{ textAlign: 'center' }}>
							<Radio.Group
								style={{
									marginBottom: 16, width: '100%'
								}}
								onChange={(e) => {
									setSelectedOption(e.target.value);
									setSelectedSign(e.target.value);
								} }
								value={selectedOption}
							>
								<Radio.Button value={1} style={{ backgroundColor: theme === "light" ? "#FFFFFF" : "#3B3737" }}><p style={{ color: theme === "light" ? "black" : "#FFFFFF" }}>Rock <Avatar src="https://symbl-world.akamaized.net/i/webp/f2/0e29d778af528ff18585b3c4088835.webp" size={18} /></p></Radio.Button>
								<Radio.Button value={2} style={{ backgroundColor: theme === "light" ? "#FFFFFF" : "#3B3737" }}><p style={{ color: theme === "light" ? "black" : "#FFFFFF" }}>Paper <Avatar src="https://symbl-world.akamaized.net/i/webp/77/ec9b6d839eb7a9868c98b397842442.webp" size={18} /></p></Radio.Button>
								<Radio.Button value={3} style={{ backgroundColor: theme === "light" ? "#FFFFFF" : "#3B3737" }}><p style={{ color: theme === "light" ? "black" : "#FFFFFF" }}>Scissors <Avatar src="https://symbl-world.akamaized.net/i/webp/c4/aa8b2a5d6d7304241d56de9f82e3d9.webp" size={18} /></p></Radio.Button>
							</Radio.Group>
							<InputNumber
								style={{
									backgroundColor: theme === "light" ? "#FFFFFF" : "#3B3737",
									borderColor: theme === "light" ? "#FFFFFF" : "#3B3737",
									color: theme === "light" ? "black" : "#FFFFFF",
									borderRadius: '5px'
								}}
								placeholder="Amount"
								inputMode="numeric"
								addonBefore={<Avatar src={theLogo === null ? "https://xno.nano.org/images/xno-badge-blue.svg" : theLogo} style={{ height: '80%' }} />}
								onChange={(value: number | string | null) => {
									if (!isNaN(Number(value))) {
										setAmount(Number(value));
									} else {
										console.error("La valeur n'est pas un nombre valide");
									}
								} }
								min={0}
								value={amount}
								max={maxAmount}
								addonAfter={<Space>
									<Button size='small' onClick={handleDivideByTwo}><p style={{ color: theme === "light" ? "black" : "#FFFFFF" }}>÷2</p></Button>
									<Button size='small' onClick={handleMultiplyByTwo}><p style={{ color: theme === "light" ? "black" : "#FFFFFF" }}>×2</p></Button>
									<Button size='small' onClick={handleSetToMax}><p style={{ color: theme === "light" ? "black" : "#FFFFFF" }}>Max</p></Button>
								</Space>} />
						</CardBody>
						<Divider />
						<CardFooter style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
							{isAuthenticated ? (
								<NextButton radius="full" className="bg-gradient-to-tr from-blue-500 to-green-500 text-white shadow-lg" onClick={handlePlay}>
									Play
								</NextButton>
							) : (

								<><NextButton
									isExternal
									as={Link}
									className="text-sm font-normal text-default-600 bg-default-100"
									href={siteConfig.links.sponsor}
									startContent={<FaUserAstronaut className="text-danger" style={{ color: 'blue' }} />}
									// variant="shadow"
									color="primary"
								>
									Signup
								</NextButton>
									<NextButton
										as={Link}
										className="text-sm font-normal text-default-600 bg-default-100"
										href="/login"
										startContent={<HiOutlineLogin className="text-danger" style={{ color: 'blue' }} />}
										// variant="shadow"
										color="primary"
										style={{ marginLeft: '10px' }}
									>
										Login
									</NextButton></>
							)}
						</CardFooter>
			</Card>
					
			</>
			)}
			<div className="flex w-full flex-col" style={{borderTop: '15px', paddingTop: '15px'}}>
				<Tabs aria-label="Options" color="primary" variant="bordered">
					<Tab
					key="all_bets"
					title={
						<div className="flex items-center space-x-2">
						<FaDice/>
						<span>Bets</span>
						</div>
					}
					>
						<Table 
							aria-label="Example table with client side pagination"
							bottomContent={
								<div className="flex w-full justify-center">
								<Pagination
									isCompact
									showControls
									showShadow
									color="secondary"
									page={page}
									total={pages}
									onChange={(page) => setPage(page)}
								/>
								</div>
							}
							classNames={{
								wrapper: "min-h-[222px]",
							}}
							>
							<TableHeader>
								<TableColumn key="user">User</TableColumn>
								<TableColumn key="amount">Amount</TableColumn>
								<TableColumn key="currency">Currency</TableColumn>
							</TableHeader>
							<TableBody items={items}>
								{(item) => (
								<TableRow key={item.user}>
									{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
								</TableRow>
								)}
							</TableBody>
							</Table>
					</Tab>
					{/* <Tab
					key="music"
					title={
						<div className="flex items-center space-x-2">
						<InfoCircleOutlined/>
						<span>Music</span>
						</div>
					}
					/> */}
				</Tabs>
				</div> 
		</>
	);
}
