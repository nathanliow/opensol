import { pinata } from '@/pinataConfig';

export const uploadImageToPinata = async (file: File): Promise<string> => {
  try {
    const urlRequest = await fetch("/api/pinata/url");
    if (!urlRequest.ok) {
      throw new Error('Failed to get Pinata upload credentials'); 
    }
    
    const urlResponse = await urlRequest.json();
    
    const upload = await pinata.upload.public
      .file(file)
      .url(urlResponse.url); // Upload the file with the signed URL

    return "https://rose-rear-cobra-866.mypinata.cloud/ipfs/" + upload.cid;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

export const uploadImageToPinataString = `export const uploadImageToPinata = async (file: File): Promise<string> => {
  try {
    // Set up a /api/pinata/url route.ts file to get the signed URL
    const urlRequest = await fetch("/api/pinata/url");
    if (!urlRequest.ok) {
      throw new Error('Failed to get Pinata upload credentials'); 
    }
    
    const urlResponse = await urlRequest.json();
    
    const upload = await pinata.upload.public
      .file(file)
      .url(urlResponse.url); // Upload the file with the signed URL

    // Replace rose-rear-cobra-866 with your pinata gateway URL
    return "https://rose-rear-cobra-866.mypinata.cloud/ipfs/" + upload.cid;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}`;