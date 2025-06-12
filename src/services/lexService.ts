import { LexRuntimeV2Client, RecognizeTextCommand, Slot, ImageResponseCard as LexImageResponseCard } from "@aws-sdk/client-lex-runtime-v2";

// Initialize the Lex client
const lexClient = new LexRuntimeV2Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

interface Button {
  text: string;
  value: string;
}

interface ImageResponseCard {
  title: string;
  buttons: Button[];
}

export interface MessageType {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  responseCard?: ImageResponseCard;
}

export interface LexResponse {
  message: string;
  sessionId: string;
  intentName?: string;
  slots?: Record<string, Slot>;
  responseCard?: LexImageResponseCard;
}

export const sendMessageToLex = async (
  message: string,
  sessionId: string
): Promise<LexResponse> => {
  try {
    const command = new RecognizeTextCommand({
      botId: process.env.NEXT_PUBLIC_LEX_BOT_ID,
      botAliasId: process.env.NEXT_PUBLIC_LEX_BOT_ALIAS_ID,
      localeId: "en_US",
      sessionId,
      text: message,
    });

    const response = await lexClient.send(command);
    
    return {
      message: response.messages?.[0]?.content || "",
      sessionId: response.sessionId || sessionId,
      intentName: response.interpretations?.[0]?.intent?.name,
      slots: response.interpretations?.[0]?.intent?.slots,
      responseCard: response.messages?.find(m => m.contentType === "ImageResponseCard")?.imageResponseCard
    };
  } catch (error) {
    console.error("Error sending message to Lex:", error);
    throw error;
  }
};

export const getConversationHistory = async (sessionId: string): Promise<MessageType[]> => {
  try {
 
    const response = await fetch(`/api/chat/history?sessionId=${sessionId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch conversation history');
    }
    
    return data.messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: new Date(msg.timestamp),
      responseCard: msg.responseCard
    }));
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    throw error;
  }
}; 