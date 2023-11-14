'use client'; // If used in Pages Router, is no need to add "use client"

import React from 'react';
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

import { link as linkStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import {
	TwitterIcon,
	GithubIcon,
	DiscordIcon,
	HeartFilledIcon,
	SearchIcon,
	MoonIcon,
	SunIcon,
} from "@/components/icons";

import { Logo } from "@/components/icons";

export const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const menuItems = [
		"Profile",
		"Dashboard",
		"Activity",
		"Analytics",
		"System",
		"Deployments",
		"My Settings",
		"Team Settings",
		"Help & Feedback",
		"Log Out",
	];

	return (
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
				<ul className="hidden lg:flex gap-4 justify-start ml-2">
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
            isExternal
						as={Link}
						className="text-sm font-normal text-default-600 bg-default-100"
						href={siteConfig.links.sponsor}
						startContent={<HiOutlineLogin className="text-danger" />}
						variant="shadow"
					>
						Login
					</Button>
				</NavbarItem>
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
	);
};
