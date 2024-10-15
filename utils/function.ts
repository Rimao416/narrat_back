export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
import twilio from "twilio";
export const sendOTPToPhone = async (phoneNumber: string, otp: string) => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
     await client.messages.create({
      from: process.env.FROM_TWILLIO_NUMBER,
      to: phoneNumber,
      body: `Votre code d'activation est : ${otp}`,
    });
  } catch (error: any) {
    // console.error("Failed to send message:", error.message);
  }
};
