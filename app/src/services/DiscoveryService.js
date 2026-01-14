import Constants from 'expo-constants';
import * as Network from 'expo-network';

export const getAutoSignalingUrl = async () => {
  // 1. Try to get the host from Expo's dev server (useful for development)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }

  // 2. Fallback: Try to guess based on device's own IP
  try {
    const ip = await Network.getIpAddressAsync();
    const subnet = ip.substring(0, ip.lastIndexOf('.'));
    // In a real app, you might scan the subnet here.
    // For now, we'll return a default or the same subnet guess.
    console.log('Device IP:', ip, 'Subnet:', subnet);
    return `http://${subnet}.1:3000`; // Common gateway/server guess
  } catch (e) {
    return 'http://localhost:3000';
  }
};
