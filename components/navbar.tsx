'use client'; // If used in Pages Router, is no need to add "use client"

import React, { useState, useEffect } from 'react';
import {
	Navbar as NextUINavbar,
	NavbarContent,
	NavbarMenu,
	NavbarMenuToggle,
	NavbarBrand,
	NavbarItem,
	NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { FaUserAstronaut } from "react-icons/fa";
import { HiOutlineLogin } from "react-icons/hi";
import { BiLogOutCircle } from "react-icons/bi";
import { HiWallet } from "react-icons/hi2";
import { RiAccountCircleLine } from "react-icons/ri";
import { VscSettings } from "react-icons/vsc";
import { SlWallet } from "react-icons/sl";
import { LuCopy } from "react-icons/lu";
import { useCookies } from 'react-cookie';
import Cookies from 'js-cookie';
import {DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Image, Select as NextSelect, SelectItem as NextSelectItem} from "@nextui-org/react";
import axios from 'axios';
import blake from 'blakejs';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Select, Typography, Avatar as AntAvatar, message, Popconfirm, Button as AntButton, QRCode, ConfigProvider } from 'antd';

import io from 'socket.io-client';

import { link as linkStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";

import { GithubIcon, Logo } from "@/components/icons";

const socket = io(`${siteConfig.apiUrl}`);
const { Text } = Typography;

const info = (customMessage: string) => {
	message.info(`${customMessage}`);
};
  
message.config({
	duration: 2,
	maxCount: 1, // Spécifiez le nombre maximal de messages à afficher
	rtl: true,
});

export const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	
	const [cookies, setCookie, removeCookie] = useCookies(['token', 'currency']);
	
    const isAuthenticated = !!cookies.token;

	const [email, setEmail] = useState('');
  	const [avatar, setAvatar] = useState('');

	const [balanceData, setBalanceData] = useState(null);
	const [miniDeposit, setMiniDeposit] = useState<{ [key: string]: string }>({});
	const [deposit, setDeposit] = useState<{ [key: string]: string }>({});
	const [latestDeposit, setLatestDeposit] = useState('');
	const [online, setOnline] = useState(1);
	const [actuelCurrency, setActuelCurrency] = useState('XNO');

	// Liste de toutes les cryptos prisent en charge, c'est utilisé pour récupérer les logo à partir du nom de la crypto
	const options = [
		{ value: "xno", label: 'XNO', image: 'https://xno.nano.org/images/xno-badge-blue.svg' },
		{ value: "ban", label: 'BAN', image: 'https://banano.cc/presskit/banano-icon.svg' },
		{ value: "ana", label: 'ANA', image: 'https://nanswap.com/logo/ANA.png' },
		{ value: "xdg", label: 'XDG', image: 'https://dogenano.io/static/media/XDG.00462477.png' },
	];

	// ça, c'est le genre de truc inutile mais que je laisse par flemme 
	const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

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
			  setAvatar(`https://robohash.org/${response.data.md5}?set=set4`);
			}
		  })
		  .catch(error => {
			console.error('Error fetching email:', error);
		  })
	}, [isAuthenticated, cookies.token]);

	useEffect(() => {
		if (cookies.currency) {
			setActuelCurrency(cookies.currency);
		}
	}, [cookies.currency, cookies.token]);

	// Envoie d'une demande d'information sur la balance via le socket.io
	useEffect(() => {
		const fetchData = async () => {
		  if (isAuthenticated && cookies.token) {
			socket.emit('action', { action: 'balances', token: cookies.token });
		  }
		};
	
		fetchData();
	  }, [isAuthenticated, cookies.token]);

	// Récupérer l'adresse de dépot
	useEffect(() => {
		axios.get(`${siteConfig.apiUrl}/user/deposit`, {
		  headers: {
			auth: cookies.token,
		  },
		})
		  .then(response => {
			if (response.data) {
			  setDeposit(response.data);
			  setMiniDeposit({ XNO: response.data.XNO.substring(0, 20), BAN: response.data.BAN.substring(0, 20), ANA: response.data.ANA.substring(0, 20), XDG: response.data.XDG.substring(0, 20) })
			}
		  })
		  .catch(error => {
			console.error('Error fetching login history:', error);
		  });
	  }, [cookies]);

	// Fonction de deconnexion (il faut tous faire pour que l'utilisateur ne parte pas du site, il faut qu'il perde de l'argent 😂... Non plus sérieusement il est 10h59)
	const handleLogout = () => {
		removeCookie('token');
	};

	// --------------------- START SOCKET -------------------------
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

	socket.on('newDeposit', (data) => {
		const emailHash = blake.blake2bHex(email);
		if (data.email && data.email === emailHash && latestDeposit !== data.hash) {
			info(`New deposit: ${data.amount} ${data.ticket}`);
			setLatestDeposit(data.hash);
		}
	});

	socket.on('clientCount', (data) => {
		if ((data - 6)/2 > 0) {
		  setOnline((data - 6)/2);
		} else {
		  setOnline(data/2-0.5);
		}
	});
	// --------------------- END SOCKET -------------------------

	return (
		<>
			<NextUINavbar maxWidth="xl" position="sticky" isBordered onMenuOpenChange={setIsMenuOpen}>
				<NavbarContent className="sm:hidden" justify="start">
					<NavbarMenuToggle
						aria-label={isMenuOpen ? "Close menu" : "Open menu"}
						className="sm:hidden"
					/>
				</NavbarContent>
				<NavbarContent className="basis-1/5 sm:basis-full" justify="start">
					<NavbarBrand as="li" className="gap-3 max-w-fit">
						<NextLink className="flex justify-start items-center gap-1 hidden sm:flex gap-2" href="/">
							<Image src="/logo.png" alt="Logo" width={'30px'} radius='none'/>
							<p className="font-bold text-inherit">NanBet</p>
						</NextLink>
					</NavbarBrand>
					<ul className="hidden sm:flex gap-4 justify-start ml-2">
						{siteConfig.navItems.map((item) => (
							<NavbarItem key={item.href}>
								<NextLink
									className={clsx(
										linkStyles({ color: "foreground" }),
										"data-[active=true]:text-primary data-[active=true]:font-medium"
									)}
									color="foreground"
									href={item.href}
								>
									{item.label}
								</NextLink>
							</NavbarItem>
						))}
					</ul>
				</NavbarContent>

			    {isAuthenticated ? (
					<NavbarContent justify="center">
						<div style={{ display: 'flex', alignItems: 'center' }}>
						<ConfigProvider
							
						>
						<Select
							value={actuelCurrency}
							style={{ width: 120 }}
							options={options.map((option) => ({
								value: option.value,
								label: (
								<span>
									<AntAvatar src={option.image} size="small" />
									<Text strong>{balanceData ? ` | ${balanceData[option.value]}` : 'Chargement...'}</Text>
								</span>
								),
							}))}
							onChange={(value: any) => {
								setActuelCurrency(value);
								setCookie('currency', value, { path: '/' });
							}}
							/>
						</ConfigProvider>

						<Popconfirm
							placement="bottom"
							title={`Deposit ${cookies.currency?.toUpperCase() || "XNO"}`}
							description={
							<>
								<div style={{ display: 'flex', alignItems: 'center' }}>
								  <span>{miniDeposit[actuelCurrency.toUpperCase()]}</span>
								  <CopyToClipboard
									text={deposit[cookies?.currency?.toUpperCase() || 'XNO']}
									onCopy={() => info('Adresse copiée dans le presse-papiers !')}
								  >
									<LuCopy style={{ cursor: 'pointer', marginLeft: '5px' }} />
								  </CopyToClipboard>
								</div>
								<QRCode value={deposit[cookies?.currency?.toUpperCase() || 'XNO'] || '-'} className="hidden sm:flex" />
							  </>
							}
						>
							<AntButton
							icon={<SlWallet />}
							type="primary"
							ghost
							style={{ marginLeft: '5px', background: 'transparent', border: 'none' }}
							/>
						</Popconfirm>
						</div>
					</NavbarContent>
				) : null}


				<NavbarContent
					justify="end"
				>
					<NavbarItem >
						<ThemeSwitch />
					</NavbarItem>
				
					{ isAuthenticated ? (
						<>
							<NavbarContent as="div" justify="end">
								<Dropdown placement="bottom-end">
								<DropdownTrigger>
									<Avatar
									isBordered
									as="button"
									className="transition-transform"
									color="primary"
									name="Jason Hughes"
									size="sm"
									src={avatar}
									/>
								</DropdownTrigger>
								<DropdownMenu aria-label="Profile Actions" variant="faded">
									<DropdownItem key="profile" className="h-14 gap-2">
									<p className="font-semibold">Signed in as</p>
									<p className="font-semibold">{email}</p>
									</DropdownItem>
									<DropdownItem
									key="new"
									startContent={<RiAccountCircleLine className={iconClasses} />}
									description="View your information"
									href='/account'
									>
									Account
									</DropdownItem>
									<DropdownItem
									key="copy"
									startContent={<HiWallet className={iconClasses} />}
									description="Your Wallet"
									href='/wallet'
									>
									Wallet
									</DropdownItem>
									<DropdownItem
									key="copy"
									startContent={<VscSettings className={iconClasses} />}
									description="Change your settings"
									>
									Settings
									</DropdownItem>
									<DropdownItem
									key="delete"
									className="text-danger"
									color="danger"
									startContent={<BiLogOutCircle className={iconClasses} />}
									description="You are already leaving 😭"
									onClick={handleLogout}
									>
									Logout
									</DropdownItem>
								</DropdownMenu>
								</Dropdown>
							</NavbarContent>
						</>
					) : (
						<>
							<NavbarItem>
								<Button
									as={Link}
									className="text-sm font-normal text-default-600 bg-default-100"
									href="/signup"
									startContent={<FaUserAstronaut className="text-danger" style={{ color: 'blue' }}/>}
									variant="shadow"
									color="primary"
								>
									Signup
								</Button>
							</NavbarItem>

							<NavbarItem>
								<Button
									as={Link}
									className="text-sm font-normal text-default-600 bg-default-100"
									href="/login"
									startContent={<HiOutlineLogin className="text-danger" style={{ color: 'blue' }} />}
									variant="shadow"
									color="primary"
								>
									Login
								</Button>
							</NavbarItem>
						</>
					)}
				</NavbarContent>
				<NavbarMenu>
					{siteConfig.navItems.map((item) => (
					<NavbarMenuItem key={item.href}>
						<Link
						className="w-full"
						href={item.href}
						size="lg"
						>
						{item.label}
						</Link>
					</NavbarMenuItem>
					))}
				</NavbarMenu>
			</NextUINavbar>
		</>
	);
};
