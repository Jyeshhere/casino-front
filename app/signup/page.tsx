'use client'; // Ce truc qui ne sert à rien et qui est tottttalement stupide ma fait perdre un temps de dingue

import React, { useState, useEffect } from 'react';
import { title } from "@/components/primitives";
import { Button, Input, Checkbox, Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import { useTheme } from "next-themes";
import { LockIcon, MailIcon } from '@/components/icons';
import { useCookies } from 'react-cookie';
import Cookies from 'js-cookie';
import axios from 'axios';
import { SendOutlined } from '@ant-design/icons';

import { message, Form, Result } from 'antd';

import { siteConfig } from "@/config/site";
import { color } from 'framer-motion';

export default function PricingPage() {
	const { theme, setTheme } = useTheme();
	const [cookies] = useCookies(['token']);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
  const isAuthenticated = !!cookies.token;
  const [showEmailSent, setShowEmailSent] = useState(false); // État local pour gérer l'affichage

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
    const dataToSend = {
      action: 'register',
      email: email,
      password: password,
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(`${siteConfig.apiUrl}/`, dataToSend, { headers });
      if (response.data && response.data.status === 'ok') {
        // Afficher le message "Email envoyé" et le GIF
        setShowEmailSent(true);
      } else {
        console.error('Error: Invalid response from server');
        alert('Authentification échouée. Veuillez vérifier vos informations de connexion.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Authentification échouée. Veuillez vérifier vos informations de connexion.');
    }
  };

	return (
		<Card className="max-w-[400px] flex flex-col gap-1">
			<CardHeader className="flex gap-3">
				<div className="flex flex-col">
				<p className="text-md">Register Now !</p>
				</div>
			</CardHeader>
			<Divider/>
			<CardBody style={{textAlign: 'center'}}>
        { showEmailSent === false ? (
          <>
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
          </>
        ) : (
          <Result
            icon={<SendOutlined />}
            title={<div style={{ color: theme === "light" ? "black" : "white" }}>Registration email sent !</div>}
          />

        )}
                
			</CardBody>
      { showEmailSent === false ? (
        <>
        <Divider/>
        <CardFooter>
          <Button color="primary" onPress={onFinish}>
            Sign up
                  </Button>
        </CardFooter>
        </>
      ) : ( 
        null
      )}
      </Card>
	);
}
