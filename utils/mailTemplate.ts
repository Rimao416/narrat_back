export const generateEmailTemplate = (
    username: string,
    otp: string
  ): string => {
    return `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h2>Bonjour <strong>@${username}</strong>,</h2>
        <p>Nous avons reçu une demande de connexion pour votre compte. Si c'est bien vous, veuillez utiliser le code à usage unique ci-dessous pour compléter la connexion :</p>
        
        <div style="background-color: #f2f2f2; padding: 10px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        
        <p><strong>Si vous n'avez pas demandé cette connexion</strong>, veuillez ignorer ce message. Assurez-vous que personne n'a accès à votre compte et prenez les mesures nécessaires pour protéger votre sécurité.</p>
        
        <p style="font-size: 12px; color: #999;">Cet email s'adresse à @${username}</p>
      </div>
    `;
  };
  