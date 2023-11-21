'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import { title } from "@/components/primitives";
import {cn, Listbox, ListboxItem, Pagination, User, Chip, Tooltip, ChipProps, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Tabs, Tab, Avatar, Card, CardHeader, CardBody, CardFooter, Image, Link, Divider} from "@nextui-org/react";
import { HiWallet } from "react-icons/hi2";
import { siteConfig } from "@/config/site";
import blake from 'blakejs';
import io from 'socket.io-client';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { FaArrowRightArrowLeft } from "react-icons/fa6";

const socket = io(`${siteConfig.apiUrl}`);

export default function Wallet() {
	const [balanceData, setBalanceData] = useState(null);
	const [email, setEmail] = useState('');
	const [cookies, setCookie, removeCookie] = useCookies(['token', 'currency']);
    const isAuthenticated = !!cookies.token;
	
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

	useEffect(() => {
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
		const fetchData = async () => {
		  if (isAuthenticated && cookies.token) {
			socket.emit('action', { action: 'balances', token: cookies.token });
		  }
		};
	
		fetchData();
	  }, [isAuthenticated, cookies.token]);

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

	const ItemCounter = ({number}) => (
		<div className="flex items-center gap-1 text-default-400">
		  <Chip><span className="text-small">{number}</span></Chip>
		  <FaArrowRightArrowLeft className="text-xl" />
		</div>
	  );

	const IconWrapper = ({children, className}) => (
		<div className={cn(className, "flex items-center rounded-small justify-center w-7 h-7")}>
		  {children}
		</div>
	  );
	return (
		<Card className="max-w-[400px]">
			<CardHeader className="flex gap-3">
				<HiWallet size="1.5em" />
				<div className="flex flex-col">
				<p className="text-md">Your Wallet</p>
				</div>
			</CardHeader>
			<Divider/>
			<CardBody>
			<Listbox
			aria-label="User Menu"
			onAction={(key) => alert(key)}
			className="p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 max-w-[300px] overflow-visible shadow-small rounded-medium"
			itemClasses={{
				base: "px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80",
			}}
			>
			<ListboxItem
				key="issues"
				endContent={<ItemCounter number={balanceData ? balanceData["xno"] : 0} />}
				startContent={
				<IconWrapper className="bg-success/10 text-success">
					<Image src='https://xno.nano.org/images/xno-badge-blue.svg' className="text-lg " />
				</IconWrapper>
				}
			>
				Nano
			</ListboxItem>
			<ListboxItem
				key="issues"
				endContent={<ItemCounter number={balanceData ? balanceData["ban"] : 0} />}
				startContent={
				<IconWrapper className="bg-success/10 text-success">
					<Image src='https://nanswap.com/logo/BAN.svg' className="text-lg " />
				</IconWrapper>
				}
			>
				Banano
			</ListboxItem>
			<ListboxItem
				key="issues"
				endContent={<ItemCounter number={balanceData ? balanceData["ana"] : 0} />}
				startContent={
				<IconWrapper className="bg-success/10 text-success">
					<Image src='https://nanswap.com/logo/ANA.png' className="text-lg " />
				</IconWrapper>
				}
			>
				Ananos
			</ListboxItem>
			<ListboxItem
				key="issues"
				endContent={<ItemCounter number={balanceData ? balanceData["xdg"] : 0} />}
				startContent={
				<IconWrapper className="bg-success/10 text-success">
					<Image src='https://dogenano.io/static/media/XDG.00462477.png' className="text-lg " />
				</IconWrapper>
				}
			>
				Dogenano
			</ListboxItem>
			
			</Listbox>
			</CardBody>
			
			</Card>
	);
}
