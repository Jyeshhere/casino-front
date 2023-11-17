'use client'; 

import React, { useState, useEffect } from 'react';
import { title } from "@/components/primitives";
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Button as NextButton} from "@nextui-org/react";
import { InputNumber, Button, message, Table, Spin, Result, Tooltip, Radio, Tag, Popover, Avatar, Space } from 'antd';
import { useTheme } from "next-themes";
import { useCookies } from 'react-cookie';
import { FaUserAstronaut } from "react-icons/fa";
import { HiOutlineLogin } from "react-icons/hi";
import { siteConfig } from "@/config/site";
import axios from 'axios';
import { generateSeed } from "@/modules/utils"
import { CopyOutlined, InfoCircleOutlined, SmileOutlined, FrownOutlined, MehOutlined, EuroOutlined, BankOutlined } from '@ant-design/icons';

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
	console.log(theme);
	const [amount, setAmount] = useState<number | null>(null);
	const [selectedOption, setSelectedOption] = useState(1);
	const [loading, setLoading] = useState(false);
	const [selectedSign, setSelectedSign] = useState(1);
	const [opponentSign, setOpponentSign] = useState(null);
	const [allJson, setAllJson] = useState(null);
	const [emojiRain, setEmojiRain] = useState([]);
	const [maxAmount, setMaxAmount] = useState<number>(0);
	
	const [balanceData, setBalanceData] = useState(null);

	const emojisDefault: string[] = ['🌟', '❤️', '🎉', '🍀', '🌈', '🚀', '🌸', '🌺', '🌻', '🌼'];
	const emojisWin: string[] = ['🎉', '🏆', '🥇', '🌟'];
	const emojisLose: string[] = ['😭', '💔', '😢', '🙁'];
	const emojisEqual: string[] = ['💁', '🤝', '🙆', '🤷'];

	const getResultText = (result: { status: string; }) => {
		if (result.status === 'win') return `You win: x2`;
		if (result.status === 'lose') return `You lose: x0`;
		if (result.status === 'egal') return `Egal: x1`;
		return 'Inconnu';
	  };
	
	const getResultIcon = (result: { status: string; }) => {
		if (result.status === 'win') return <SmileOutlined />;
		if (result.status === 'lose') return <FrownOutlined />;
		if (result.status === 'egal') return <MehOutlined />;
		return 'Inconnu';
	  };

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
		  currency: cookies.currency,
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
			setOpponentSign(response.data.status);
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
	
			// Mettez à jour les soldes après avoir reçu le résultat du pari
			updateBalances();
		  })
		  .catch((error) => {
			setLoading(false);
			message.error('Une erreur s\'est produite lors du jeu : ' + error.message);
		  });
	};

	const handleDivideByTwo = () => {
		setAmount(amount / 2);
	};
	
	const handleMultiplyByTwo = () => {
		if (amount * 2 <= maxAmount) {
		  setAmount(amount * 2);
		}
	};
	
	const handleSetToMax = () => {
		setAmount(maxAmount);
	};

	useEffect(() => {
		if (balanceData) {
		  const selectedCrypto = options.find((option) => option.value === cookies.currency);
		  console.log(selectedCrypto);
		  if (selectedCrypto) {
			axios.get(`${siteConfig.apiUrl}/infos/maxBet`, {
			  headers: {
				auth: cookies.token,
			  },
			})
			  .then(response => {
				if (response.data) {
				  if (balanceData[selectedCrypto.value] >= response.data[selectedCrypto.value]) {
					setMaxAmount(response.data[selectedCrypto.value]);
				  } else {
					setMaxAmount(balanceData[selectedCrypto.value]);
				  }
				}
			  })
			  .catch(error => {
				console.error('Error fetching login history:', error);
			  });
			
		  }
		}
	  }, [selectedOption, balanceData, cookies.currency]);

	useEffect(() => {
		updateBalances();
	}, []);
	return (
		<Card className="max-w-[400px]">
			<CardHeader className="flex gap-3">
				<div className="flex flex-col">
				<p className="text-md">Jeu Pierre-Papier-Ciseaux</p>
				</div>
			</CardHeader>
			<Divider/>
			<CardBody style={{textAlign: 'center'}}>
				<Radio.Group
					style={{ 
						marginBottom: 16, width: '100%'					
					}}
					onChange={(e) => {
						setSelectedOption(e.target.value);
						setSelectedSign(e.target.value);
					}}
					value={selectedOption}
				>
					<Radio.Button value={1} style={{backgroundColor: theme === "light" ? "#FFFFFF" : "#3B3737"}}><p style={{color: theme === "light" ? "black" : "#FFFFFF"}}>Rock <Avatar src="https://symbl-world.akamaized.net/i/webp/f2/0e29d778af528ff18585b3c4088835.webp" size={18}/></p></Radio.Button>
					<Radio.Button value={2} style={{backgroundColor: theme === "light" ? "#FFFFFF" : "#3B3737"}}><p style={{color: theme === "light" ? "black" : "#FFFFFF"}}>Paper <Avatar src="https://symbl-world.akamaized.net/i/webp/77/ec9b6d839eb7a9868c98b397842442.webp" size={18}/></p></Radio.Button>
					<Radio.Button value={3} style={{backgroundColor: theme === "light" ? "#FFFFFF" : "#3B3737"}}><p style={{color: theme === "light" ? "black" : "#FFFFFF"}}>Scissors <Avatar src="https://symbl-world.akamaized.net/i/webp/c4/aa8b2a5d6d7304241d56de9f82e3d9.webp" size={18}/></p></Radio.Button>
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
					addonBefore={
						<Avatar src="https://nanswap.com/logo/XNO.svg" style={{ height: '80%' }} />
					}
					onChange={(value: number | string | null) => {
						if (!isNaN(Number(value))) {
							setAmount(Number(value));
						} else {
							console.error("La valeur n'est pas un nombre valide");
						}
					}}					
					min={0}
					value={amount}
					max={maxAmount}
					addonAfter={
						<Space>
						<Button size='small' onClick={handleDivideByTwo}><p style={{color: theme === "light" ? "black" : "#FFFFFF"}}>÷2</p></Button>
						<Button size='small' onClick={handleMultiplyByTwo}><p style={{color: theme === "light" ? "black" : "#FFFFFF"}}>×2</p></Button>
						<Button size='small' onClick={handleSetToMax}><p style={{color: theme === "light" ? "black" : "#FFFFFF"}}>Max</p></Button>
						</Space>
					}
				/>
			</CardBody>
			<Divider/>
			<CardFooter style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				{ isAuthenticated ? (
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
							style={{marginLeft: '10px'}}
						>
								Login
						</NextButton></>
				)}
			</CardFooter>
			</Card>
	);
}
