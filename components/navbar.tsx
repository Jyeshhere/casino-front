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
import { useCookies } from 'react-cookie';
import Cookies from 'js-cookie';
import {DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar} from "@nextui-org/react";
import axios from 'axios';

import { link as linkStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";

import { Logo } from "@/components/icons";

export const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	
	const [cookies] = useCookies(['token']);
    const isAuthenticated = !!cookies.token;

	const [email, setEmail] = useState('');
  	const [avatar, setAvatar] = useState('');

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
							<img src="/logo.png" alt="Logo" width={'30px'}/>
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
									color="secondary"
									name="Jason Hughes"
									size="sm"
									src={avatar}
									/>
								</DropdownTrigger>
								<DropdownMenu aria-label="Profile Actions" variant="flat">
									<DropdownItem key="profile" className="h-14 gap-2">
									<p className="font-semibold">Signed in as</p>
									<p className="font-semibold">{email}</p>
									</DropdownItem>
									<DropdownItem key="settings">My Profil</DropdownItem>
									<DropdownItem key="team_settings">Settings</DropdownItem>
									<DropdownItem key="analytics">Analytics</DropdownItem>
									<DropdownItem key="system">System</DropdownItem>
									<DropdownItem key="configurations">Configurations</DropdownItem>
									<DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
									<DropdownItem key="logout" color="danger">
									Log Out
									</DropdownItem>
								</DropdownMenu>
								</Dropdown>
							</NavbarContent>
						</>
					) : (
						<>
							<NavbarItem>
								<Button
						isExternal
									as={Link}
									className="text-sm font-normal text-default-600 bg-default-100"
									href={siteConfig.links.sponsor}
									startContent={<FaUserAstronaut className="text-danger" />}
									variant="shadow"
								>
									Signup
								</Button>
							</NavbarItem>

							<NavbarItem>
								<Button
									as={Link}
									className="text-sm font-normal text-default-600 bg-default-100"
									href="/login"
									startContent={<HiOutlineLogin className="text-danger" />}
									variant="shadow"
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
