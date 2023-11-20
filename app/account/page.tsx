'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { title } from "@/components/primitives";
import {Pagination, User, Chip, Tooltip, ChipProps, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Tabs, Tab, Avatar, Card, CardHeader, CardBody, CardFooter, Image, Link, Divider} from "@nextui-org/react";
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { siteConfig } from "@/config/site";
import { RetweetOutlined, CopyOutlined, InfoCircleOutlined, SmileOutlined, FrownOutlined, MehOutlined, EuroOutlined, BankOutlined } from '@ant-design/icons';
import { Row, Col, Statistic, Card as AntCard, Typography, Button as AntButton } from 'antd';
import { StickyOffsets } from 'rc-table/lib/interface';
import { FaMoneyBillWave, FaSeedling } from "react-icons/fa";
import { MdOutlineTimelapse } from "react-icons/md";
import { FaPastafarianism, FaDice, FaEye, FaEdit } from "react-icons/fa";
import { useTheme } from "next-themes";
import TimeAgo from 'javascript-time-ago'
import { CiCircleCheck } from "react-icons/ci";
import { GrCloudComputer } from "react-icons/gr";
import ReactTimeAgo from 'react-time-ago'
import { FaHouseChimneyUser } from "react-icons/fa6";
import { RiLuggageDepositLine } from "react-icons/ri";

import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)

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
	const [loginHistoryData, setLoginHistoryData] = useState<historysData[]>([]);
	const [depositData, setDepositData] = useState<historysData[]>([]);

	
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
					{String(user.amount).substring(0, 7)}
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
			case "ticket":
			const currencyOptionTicket = options.find((option) => option.value === user.ticket.toLowerCase());
			if (currencyOptionTicket) {
			return (
				<Image
                    src={currencyOptionTicket.logo}
                    alt={currencyOptionTicket.label}
                	style={{ width: '24px', marginRight: '8px' }}
                />
			);
			} else {
				return user.ticket;
			}
			case "actions":
				return (
				  <div className="relative flex items-center gap-2">
					<Tooltip content="Check validity">
					  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
						<CiCircleCheck />
					  </span>
					</Tooltip>
				  </div>
				);
			case "ip":
				return (
					<Chip
						startContent={<GrCloudComputer size={18} />}
						variant="faded"
						color="success"
					>
						{user.ip}
					</Chip>
				);
			case "date":
				return (
					<ReactTimeAgo date={user.date}/>
				);
			case "explorer":
				console.log(`44444: ${JSON.stringify(user)}`);
				const url = {xno: "https://www.nanolooker.com/block/", ban: "https://creeper.banano.cc/hash/", xdg: "https://explorer.dogenano.io/block/", ana: "https://ananault.lightcord.org/transaction/"}
				
				return (
					<Link href={`${url[user.ticket.toLowerCase() as keyof typeof url]}${user.hashTransac}`}>Here</Link>
				);
		  default:
			return cellValue;
		}
	  }, []);

	const [page, setPage] = React.useState(1);
	const [pageLogin, setPageLogin] = React.useState(1);
	const [pageDeposit, setPageDeposit] = React.useState(1);
  	const rowsPerPage = 10;

	const pages = Math.ceil(historyData.length / rowsPerPage);
	const pagesLogin = Math.ceil(loginHistoryData.length / rowsPerPage);
	const pagesDeposit = Math.ceil(depositData.length / rowsPerPage);

	const items = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;
	
		return historyData.slice(start, end);
	}, [page, historyData]);

	const itemsLogin = React.useMemo(() => {
		const start = (pageLogin - 1) * rowsPerPage;
		const end = start + rowsPerPage;
	
		return loginHistoryData.slice(start, end);
	}, [pageLogin, loginHistoryData]);

	const itemsDeposit = React.useMemo(() => {
		const start = (pageDeposit - 1) * rowsPerPage;
		const end = start + rowsPerPage;
	
		return depositData.slice(start, end);
	}, [pageDeposit, depositData]);

	const sortLatestBets = (bets: any[]) => {
		return bets.sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
	};

	useEffect(() => {
		axios.get(`${siteConfig.apiUrl}/user/deposit_history`, {
		  headers: {
			auth: cookies.token
		  }
		})
		.then(response => {
		  if (response.data) {
			// Assurez-vous que response.data est un tableau, sinon encapsulez-le dans un tableau
			const depositDataArray = Array.isArray(response.data) ? response.data : [response.data];
			setDepositData(depositDataArray);
		  }
		})
		.catch(error => {
		  console.error('Error fetching email:', error);
		});
	  }, [cookies.token]);

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
	  }, [seedHash, cookies.token]);

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
	  }, [cookies.token, isAuthenticated]);

	useEffect(() => {
		// Récupérer les données de l'historique de connexion
		axios.get(`${siteConfig.apiUrl}/user/login_history`, {
			headers: {
			  auth: cookies.token,
			},
		  })
			.then(response => {
			  if (response.data && Array.isArray(response.data)) {
				// Tri du tableau par ID du plus grand au plus petit
				const sortedData = response.data.sort((a, b) => b.id - a.id);
				setLoginHistoryData(sortedData);
			  }
			})
			.catch(error => {
			  console.error('Error fetching login history:', error);
			});
	}, [cookies.token]);

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
	  }, [cookies.token]);

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
					<Chip color="warning" variant="dot">
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
					style={{paddingLeft: '10px'}}
				>
						<Tab
						key="your_bets"
						title={
							<div className="flex items-center space-x-2">
							<FaDice/>
							<span>Your bets</span>
							</div>
						}
						>
							<Table 
							aria-label="Example table with client side pagination"
							bottomContent={
								pages > 0 ? (
								  <div className="flex w-full justify-center">
									<Pagination
									  isCompact
									  showControls
									  showShadow
									  color="primary"
									  page={page}
									  total={pages}
									  onChange={(page) => setPage(page)}
									  size='sm'
									/>
								  </div>
								) : null
							}
							classNames={{
								wrapper: "min-h-[220px]",
							}}

							>
							<TableHeader>
								<TableColumn key="game">Game</TableColumn>
								<TableColumn key="amount">Amount</TableColumn>
								<TableColumn key="currency">Currency</TableColumn>
								<TableColumn key="actions">Action</TableColumn>
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
						<Tab
						key="SEED"
						title={
							<div className="flex items-center space-x-2">
							<FaHouseChimneyUser/>
							<span>Connections</span>
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
									page={pageLogin}
									total={pagesLogin}
									onChange={(pageLogin) => setPageLogin(pageLogin)}
									size='sm'
								/>
								</div>
							}
							classNames={{
								wrapper: "min-h-[222px]",
							}}
							>
							<TableHeader>
								<TableColumn key="ip">ip</TableColumn>
								<TableColumn key="date">Date</TableColumn>
							</TableHeader>
							<TableBody items={itemsLogin}>
								{(item) => (
								<TableRow key={item.ip}>
									{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
								</TableRow>
								)}
							</TableBody>
							</Table>
						</Tab>
						<Tab
						key="DEPOSIT"
						title={
							<div className="flex items-center space-x-2">
							<RiLuggageDepositLine/>
							<span>Deposits</span>
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
									page={pageDeposit}
									total={pagesDeposit}
									onChange={(pageDeposit) => setPageDeposit(page)}
									size='sm'
								/>
								</div>
							}
							classNames={{
								wrapper: "min-h-[222px]",
							}}
							>
							<TableHeader>
								<TableColumn key="amount">Amount</TableColumn>
								<TableColumn key="ticket">Currency</TableColumn>
								<TableColumn key="explorer">View</TableColumn>
							</TableHeader>
							<TableBody items={itemsDeposit}>
								{(item) => (
								<TableRow key={item.amount}>
									{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
								</TableRow>
								)}
							</TableBody>
							</Table>
							
						</Tab>
					</Tabs>
				</Card>
		</>
	);
}
