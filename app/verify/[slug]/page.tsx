'use client';
import { Result } from "antd";
import { CheckCircleOutlined, WarningOutlined, LoadingOutlined } from '@ant-design/icons';
import { useCookies } from 'react-cookie';
import React, { useState, useEffect } from 'react';
import { siteConfig } from "@/config/site";
import { Link } from "@nextui-org/link";
import { Card, Button } from "@nextui-org/react";
import axios from 'axios';

export default function Page({ params }: { params: { slug: string } }) {
	const data = params.slug;
	const [verificationStatus, setVerificationStatus] = useState("loading");
	const [loading, setLoading] = useState(true); // État pour indiquer si la requête est en cours
	const [cookies] = useCookies(['token']);
	const isAuthenticated = !!cookies.token;
	const [caca, setCaca] = useState(false);

	useEffect(() => {
		// Effectuez la requête vers le serveur avec le paramètre :data
		fetch(`${siteConfig.apiUrl}/verify/${data}`)
		  .then((response) => response.json()) // Extrayez les données JSON de la réponse
		  .then((data) => {
			// if (!caca) {
			//   console.log(data);
			// 	if (data.status && data.status == "ok" && verificationStatus == "loading") {
			// 		setVerificationStatus('success');
			// 	} else if (verificationStatus == "loading" && data.status != "ok") {
			// 		setVerificationStatus('failure');
			// 	}
			// }
			setVerificationStatus('success');
		  })
		  .catch((error) => {
			console.error("Error verifying data:", error);
			if (verificationStatus == "loading") {
				setVerificationStatus("failure");
			}
			
		  })
		  .finally(() => {
			setLoading(false); // Définissez loading sur false après la fin de la requête
			setCaca(true);
		  });
	  }, []); // Assurez-vous que 'data' et 'caca' sont inclus dans les dépendances du useEffect
	  
	
	  useEffect(() => {
		if (isAuthenticated) {
		  window.location.href = '/'; // Redirection automatique
		}
	  }, [isAuthenticated]); 
	
	  let gifUrl;
	  let message;
	  if (loading) {
		gifUrl = <LoadingOutlined />; // Affichez l'icône de chargement pendant que la requête est en cours
		message = "Verification in progress...";
	  } else if (verificationStatus === "success") {
		gifUrl = <CheckCircleOutlined />;
		message = "Welcome among us 😁";
	  } else if (verificationStatus === "failure") {
		gifUrl = <WarningOutlined />;
		message = "An error has occurred!";
	  } else {
		gifUrl = "";
	  }

	  return (
		<>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "50vh",
				}}
				>
				<Card title="Verification Result">
					<Result
					icon={gifUrl}
					title={message}
					extra={<Link href="/login"><Button color="primary">Login</Button></Link>}
					/>
				</Card>
			</div>
		</>
	  );
}