import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";

let streamVideoClient = null;

export const initializeStreamClient = async (user, token) => {
  try {
    const apiKey = import.meta.env.VITE_STREAM_API_KEY;
    
    if (!apiKey) {
      throw new Error("VITE_STREAM_API_KEY environment variable is not set");
    }

    streamVideoClient = new StreamVideoClient({
      apiKey,
      user,
      token,
    });

    return streamVideoClient;
  } catch (error) {
    console.error("Failed to initialize stream client:", error);
    throw error;
  }
};

export const disconnectStreamClient = async () => {
  try {
    if (streamVideoClient) {
      await streamVideoClient.disconnectUser();
      streamVideoClient = null;
    }
  } catch (error) {
    console.error("Failed to disconnect stream client:", error);
  }
};

export const getStreamClient = () => {
  return streamVideoClient;
};
