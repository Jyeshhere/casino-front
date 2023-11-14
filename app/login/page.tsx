'use client'; // Ce truc qui ne sert à rien et qui est tottttalement stupide ma fait perdre un temps de dingue

import React, { useState, useEffect } from 'react';
import { title } from "@/components/primitives";
import { Button, Input, Checkbox, Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import { useTheme } from "next-themes";
import { LockIcon, MailIcon } from '@/components/icons';
import { useCookies } from 'react-cookie';
import Cookies from 'js-cookie';
import axios from 'axios';

import { message, Form } from 'antd';

import { siteConfig } from "@/config/site";

export default function PricingPage() {
	const { theme, setTheme } = useTheme();
	const [cookies] = useCookies(['token']);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
    const isAuthenticated = !!cookies.token;

	// Petite redirection si il est déjà connecté (ça sert à rien mais si on peut le faire pourquoi se priver)
	useEffect(() => {
		if (isAuthenticated) {
		  window.location.href = '/'; // Automatic redirection
		}
	});

	// Pour les data du form (je trouve que ant et nextui se complettent bien, ils ont tous les deux des defauts et mélanger les deux permet d'avoir tous les défauts possible. Je suis juste le plus intelligent, un QI qui n'a encore jamais été vu)
	const handleEmailChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
		setEmail(event.target.value); // Mettez à jour l'état avec la nouvelle valeur de l'email
	};

	const handlePasswordChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
		setPassword(event.target.value); // Mettez à jour l'état avec la nouvelle valeur de l'email
	};

	// Reponse de l'envoie de la connexion vers le backend (tu crois quelqu'un va un jour lire ces magnifique commentaires... Il est 19h48 et je sais même si ce que je fais est utile... en plus j'ai un bac à réviser lol 😂)
	const onFinish = async () => {
        // Créez un objet avec les données à envoyer
        const dataToSend = {
          action: 'login',
          email: email, // Utilisez la valeur du champ email
          password: password, // Utilisez la valeur du champ password
        };
        console.error(dataToSend);
        // Créez un objet d'en-tête avec le type de contenu JSON
        const headers = {
          'Content-Type': 'application/json',
        };
      
        try {
          // Effectuez la requête POST avec l'en-tête JSON spécifié
          const response = await axios.post(`${siteConfig.apiUrl}/`, dataToSend, { headers });
      
          // Vérifiez si la réponse contient un champ "success" (le token du cookie)
          if (response.data && response.data.success) {
            // Créez un cookie avec le nom "token" et la valeur du token
            Cookies.set('token', response.data.success);
            window.location.href = "/";
          } else {
            console.error('Error: Invalid response from server');
            message.error('Authentification échouée. Veuillez vérifier vos informations de connexion.');
          }
        } catch (error) {
          console.error('Error:', error);
          message.error('Authentification échouée. Veuillez vérifier vos informations de connexion.');
        }
    };

	return (
		<Card className="max-w-[400px] flex flex-col gap-1">
			<CardHeader className="flex gap-3">
				<div className="flex flex-col">
				<p className="text-md">Login Now !</p>
				</div>
			</CardHeader>
			<Divider/>
			<CardBody style={{textAlign: 'center'}}>
				<div style={{ marginBottom: '5px' }}>
					<Input
						autoFocus
						endContent={
							<MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
						}
						label="Email"
						placeholder="Enter your email"
						variant="bordered"
						value={email}
						onChange={handleEmailChange}
					/>
				</div>
				
                <Input
                  endContent={
                    <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  variant="bordered"
				  value={password}
				  onChange={handlePasswordChange}
                />
                <div className="flex py-2 px-1 justify-between">
                  <Checkbox
                    classNames={{
                      label: "text-small",
                    }}
                  >
                    Remember me
                  </Checkbox>
                  <Link color="primary" href="#" size="sm">
                    Forgot ?
                  </Link>
                </div>
			</CardBody>
			<Divider/>
			<CardFooter>
				<Button color="primary" onPress={onFinish}>
					Sign in
                </Button>
			</CardFooter>
			</Card>
	);
}
