'use client';
import { Result, message } from "antd";
import { CheckCircleOutlined, WarningOutlined, LoadingOutlined } from '@ant-design/icons';
import { useCookies } from 'react-cookie';
import React, { useState, useEffect } from 'react';
import { siteConfig } from "@/config/site";
import { Link } from "@nextui-org/link";
import { Input, Card, Button, CardHeader, CardBody, CardFooter, Divider } from "@nextui-org/react";
import axios from 'axios';
import { LockIcon, MailIcon } from '@/components/icons';
import { useTheme } from "next-themes";

export default function Page({ params }: { params: { slug: string } }) {
	const data = params.slug;
	const { theme, setTheme } = useTheme();
	const [verificationStatus, setVerificationStatus] = useState("loading");
	const [loading, setLoading] = useState(true); // État pour indiquer si la requête est en cours
	const [cookies] = useCookies(['token']);
	const isAuthenticated = !!cookies.token;
	const [caca, setCaca] = useState(false);
	const [password, setNewPassword] = useState('');
	const [showEmailSent, setShowEmailSent] = useState(false); // État local pour gérer l'affichage
    const [showErrorSent, setShowErrorSent] = useState(false); 

	const onFinish = async () => {
        // Créez un objet avec les données à envoyer
        const dataToSend = {
          action: 'forgotchange',
          password: password, // Utilisez la valeur du champ email
          uuid: data, // Utilisez la valeur du champ password
        };
        // Créez un objet d'en-tête avec le type de contenu JSON
        const headers = {
          'Content-Type': 'application/json',
        };
      
        try {
          // Effectuez la requête POST avec l'en-tête JSON spécifié
          const response = await axios.post(`${siteConfig.apiUrl}/`, dataToSend, { headers });
      
          // Vérifiez si la réponse contient un champ "success" (le token du cookie)
          if (response.data && response.data.status == "ok") {
            setShowEmailSent(true);
          } else {
            console.error('Error: Invalid response from server');
            setShowErrorSent(true);
          }
        } catch (error) {
          console.error('Error:', error);
          message.error('Change Password échouée. Veuillez vérifier vos informations de connexion.');
        }
      };

	  useEffect(() => {
		if (isAuthenticated) {
		  window.location.href = '/'; // Redirection automatique
		}
	  }, [isAuthenticated]); 

	  const handlePasswordChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
			setNewPassword(event.target.value); // Mettez à jour l'état avec la nouvelle valeur de l'email
		};

	  return (
		<>
			<div >
			<Card className="max-w-[400px] flex flex-col gap-1">
				<CardHeader className="flex gap-3">
					<div className="flex flex-col">
					<p className="text-md">Change your password</p>
					</div>
				</CardHeader>
				<Divider/>
				<CardBody style={{textAlign: 'center'}}>
					{showEmailSent ? (
						<Result
						status="success"
						title={<div style={{ color: theme === "light" ? "black" : "white" }}>The password was changed !</div>}
						extra={[
							<Link href="/login">
								<Button color="primary">
									Back Login
								</Button>
							</Link>
						]}
						/>
					) : showErrorSent ? (
						<Result
						status="warning"
						title={<div style={{ color: theme === "light" ? "black" : "white" }}>ERRROOOOOR !</div>}
						extra={[
							<Link href="/login">
								<Button color="primary">
									Back Login
								</Button>
							</Link>
						]}
						/>
					) : (
						<Input
							autoFocus
							endContent={
								<LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
							}
							label="New Password"
							placeholder="Enter your new password"
							variant="bordered"
							type="password"
							value={password}
							onChange={handlePasswordChange}
						/>
					)}
				</CardBody>
				{ showEmailSent === false && showErrorSent === false ? (
					<CardFooter>
						<Button color="primary" onPress={onFinish}>
							Change
						</Button>
					</CardFooter>
				) : (
					null
				)}
			</Card>
			</div>
		</>
	  );
}