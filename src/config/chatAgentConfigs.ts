import Logo from "../assets/Logo.png";
import humanAvatar from "../assets/ai-profile.jpeg";

export type AgentDisplayConfig = {
  name: string;
  avatar: string;
  status: string;
};

export const BOT_CONFIG: AgentDisplayConfig = {
  name: "Mutual Intelligence Assistant",
  avatar: Logo,
  status: "Online",
};

export const HUMAN_CONFIG: AgentDisplayConfig = {
  name: "Customer Support",
  avatar: humanAvatar,
  status: "Online",
};
