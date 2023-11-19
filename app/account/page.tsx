'use client';
import React, { useState, useEffect } from 'react';
import { title } from "@/components/primitives";
import {Input, Tabs, Tab, Avatar, Chip, Card, CardHeader, CardBody, CardFooter, Image, Link, Divider} from "@nextui-org/react";
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { siteConfig } from "@/config/site";
import { RetweetOutlined, CopyOutlined, InfoCircleOutlined, SmileOutlined, FrownOutlined, MehOutlined, EuroOutlined, BankOutlined } from '@ant-design/icons';
import { Row, Col, Statistic, Card as AntCard, Typography, Button as AntButton } from 'antd';
import { StickyOffsets } from 'rc-table/lib/interface';
import { FaMoneyBillWave, FaSeedling } from "react-icons/fa";
import { MdOutlineTimelapse } from "react-icons/md";
import { FaPastafarianism } from "react-icons/fa";
import { useTheme } from "next-themes";

const options = [
	{ value: "xno", label: 'XNO', logo: 'https://xno.nano.org/images/xno-badge-blue.svg' },
	{ value: "ban", label: 'BAN', logo: 'https://banano.cc/presskit/banano-icon.svg' },
	{ value: "ana", label: 'ANA', logo: 'https://nanswap.com/logo/ANA.png' },
	{ value: "xdg", label: 'XDG', logo: 'https://dogenano.io/static/media/XDG.00462477.png' },
];

interface LatestSeed {
	seed: string;
	hash: string;
}

const { Title } = Typography;

export default function BlogPage() {
	const [cookies, , removeCookie] = useCookies(['token', 'currency']);
	const isAuthenticated = !!cookies.token;
	const [email, setEmail] = useState('');
  	const [avatar, setAvatar] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [cryptoBalances, setCryptoBalances] = useState<Record<string, string | number> | null>(null);
	type historysData = any
	const [historyData, setHistoryData] = useState<historysData[]>([]);
	const [seedHash, setSeedHash] = useState<string | null>(null);
    const { theme, setTheme } = useTheme();
	const [latestSeed, setLatestSeed] = useState<LatestSeed | null>(null);

	useEffect(() => {
		axios.get(`${siteConfig.apiUrl}/user/latest_seed`, {
		  headers: {
			auth: cookies.token
		  }
		})
		.then(response => {
		  if (response.data) {
			setLatestSeed(response.data);
		  }
		})
		.catch(error => {
		  console.error('Error fetching email:', error);
		});
	  }, [seedHash]);

	const newSeed = async () => {
		axios.get(`${siteConfig.apiUrl}/user/new_seed`, {
		  headers: {
			auth: cookies.token
		  }
		})
		.then(response => {
		  if (response.data) {
			console.log(response.data.hash);
			setSeedHash(response.data.hash);
		  }
		})
		.catch(error => {
		  console.error('Error fetching email:', error);
		})
	  };
	
	useEffect(() => {
		if (!isAuthenticated) {
		  window.location.href = '/login'; // Redirection automatique
		}
	  
		axios.get(`${siteConfig.apiUrl}/user/email`, {
		  headers: {
			auth: cookies.token
		  }
		})
		  .then(response => {
			if (response.data && response.data.email) {
			  setEmail(response.data.email);
			  setAvatar(`https://robohash.org/${response.data.md5}?set=set4`);
			}
		  })
		  .catch(error => {
			console.error('Error fetching email:', error);
		  })
		  .finally(() => {
			setIsLoading(false);
		  });

		  axios.get(`${siteConfig.apiUrl}/user/history`, {
			headers: {
			  auth: cookies.token
			}
		  })
		  .then(response => {
			if (response.data && Array.isArray(response.data)) {
			  // Tri du tableau par ID du plus grand au plus petit
			  const sortedData = response.data.sort((a, b) => b.id - a.id);
			  setHistoryData(sortedData);
	  
			  // Calculer les soldes crypto par crypto
			  const balances: Record<string, number> = {};
			  options.forEach(option => {
				const cryptoData = sortedData.filter(item => item.currency === option.value);
				const totalAmount = cryptoData.reduce((sum, item) => {
				  // Vérifiez si item.amount est un texte et convertissez-le en nombre si c'est le cas
				  const amount = parseFloat(item.amount);
				  // Si amount est NaN (Not a Number), n'ajoutez rien à sum
				  if (!isNaN(amount)) {
					return sum + amount;
				  }
				  // Sinon, retournez simplement la somme actuelle sans rien ajouter
				  return sum;
				}, 0);
				balances[option.value] = totalAmount;
			  });
			  setCryptoBalances(balances);
			}
		  })
		  .catch(error => {
			console.error('Error fetching history:', error);
		  });
	  }, []);

	useEffect(() => {
		axios.get(`${siteConfig.apiUrl}/user/actual_seed`, {
		  headers: {
			auth: cookies.token
		  }
		})
		.then(response => {
		  if (response.data) {
			setSeedHash(response.data.hash);
		  }
		})
		.catch(error => {
		  console.error('Error fetching email:', error);
		})
	  }, []);

	return (
		<>
			<Card className="max-w-[400px]">
				<CardHeader className="flex gap-3">
					<Image
					alt="nextui logo"
					height={40}
					radius="sm"
					src={avatar}
					width={40}
					/>
					<div className="flex flex-col">
					<p className="text-md">
						<Chip 
						variant="shadow"
						classNames={{
						  base: "bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30",
						  content: "drop-shadow shadow-black text-white",
						}}
						>
							{email}
						</Chip>
					</p>
					</div>
				</CardHeader>
				<Divider/>
				<CardBody>
				<div className="flex w-full flex-col">
				<Tabs 
					aria-label="Options" 
					color="primary" 
					variant="underlined"
					classNames={{
					tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
					cursor: "w-full bg-[#22d3ee]",
					tab: "max-w-fit px-0 h-12",
					tabContent: "group-data-[selected=true]:text-[#06b6d4]"
					}}
				>
						<Tab
						key="EXPENSES"
						title={
							<div className="flex items-center space-x-2">
							<FaMoneyBillWave/>
							<span>Expenses</span>
							</div>
						}
						>
							<Row gutter={16}>
								<Col span={12}>
								<AntCard>
        							<Statistic title="XNO" value={cryptoBalances === null ? "Error" : cryptoBalances["xno"]} valueStyle={{ color: '#3f8600' }} prefix={<Avatar src='https://xno.nano.org/images/xno-badge-blue.svg' size='sm' />} precision={4}/>
								</AntCard>
								</Col>
								<Col span={12}>
								<AntCard bordered={false}>
									<Statistic title="XDG" value={cryptoBalances === null ? "Error" : cryptoBalances["xdg"]} valueStyle={{ color: '#3f8600' }} prefix={<Avatar src='https://dogenano.io/static/media/XDG.00462477.png' size='sm'/>} precision={4}/>
								</AntCard>
								</Col>
								<Col span={12} style={{paddingTop: '5px'}}>
								<AntCard bordered={false}>
									<Statistic title="ANA" value={cryptoBalances === null ? "Error" : cryptoBalances["ana"]} valueStyle={{ color: '#3f8600' }} prefix={<Avatar src='https://nanswap.com/logo/ANA.png' size='sm'/>} precision={4}/>
								</AntCard>
								</Col>
								<Col span={12} style={{paddingTop: '5px'}}>
								<AntCard bordered={false}>
									<Statistic title="BAN" value={cryptoBalances === null ? "Error" : cryptoBalances["ban"]} valueStyle={{ color: '#3f8600' }} prefix={<Avatar src='https://banano.cc/presskit/banano-icon.svg' size='sm'/>} precision={4}/>
								</AntCard>
								</Col>
							
							</Row>
						</Tab>
						<Tab
						key="SEED"
						title={
							<div className="flex items-center space-x-2">
							<FaSeedling/>
							<span>Seed</span>
							</div>
						}
						>
							<Tabs 
								aria-label="Options" 
								color="primary" 
								variant="underlined"
								classNames={{
								tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
								cursor: "w-full bg-[#22d3ee]",
								tab: "max-w-fit px-0 h-12",
								tabContent: "group-data-[selected=true]:text-[#06b6d4]"
								}}
							>
								<Tab
								key="currently"
								title={
									<div className="flex items-center space-x-2">
									<MdOutlineTimelapse/>
									<span>Currently</span>
									</div>
								}
								>
									<Title level={3} style={{ color: theme === "light" ? "black" : "white" }}>Sha256 of the seed:</Title>
									<Input value={seedHash === null ? "Error" : seedHash} onChange={(e) => setSeedHash(e.target.value)} />
									<br/>
									<AntButton type="primary" danger icon={<RetweetOutlined />} onClick={newSeed}>Generate new seed</AntButton>
								</Tab>
								<Tab
								key="latest"
								title={
									<div className="flex items-center space-x-2">
									<FaPastafarianism/>
									<span>Latest</span>
									</div>
								}
								>
									<Title level={3} style={{ color: theme === "light" ? "black" : "white" }}>Latest Private Seed:</Title>
									<Input value={latestSeed === null ? "No Latest Seed" : latestSeed.seed}/>
									<br/>
									<Title level={3} style={{ color: theme === "light" ? "black" : "white" }}>Latest Hash:</Title>
									<Input value={latestSeed === null ? "No Latest Seed" : latestSeed.hash}/>
								</Tab>
							</Tabs>
						</Tab>
					</Tabs>
					</div>
				</CardBody>
				<Divider/>
				<CardFooter>
					<Link
					isExternal
					showAnchorIcon
					href="https://github.com/nextui-org/nextui"
					>
					Visit source code on GitHub.
					</Link>
				</CardFooter>
				</Card>
		</>
	);
}
