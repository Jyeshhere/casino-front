'use client'; // If used in Pages Router, is no need to add "use client"

import React from 'react';
import { title } from "@/components/primitives";
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";

export default function PricingPage() {

	const rulesContent = (
		<div>
		  <h3>Kikou</h3>
		</div>
	);

	return (
		<Card className="max-w-[400px]">
			<CardHeader className="flex gap-3">
				<div className="flex flex-col">
				<p className="text-md">Jeu Pierre-Papier-Ciseaux</p>
				</div>
			</CardHeader>
			<Divider/>
			<CardBody>
				<p>Make beautiful websites regardless of your design experience.</p>
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
	);
}
