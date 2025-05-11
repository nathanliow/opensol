// Helper function to convert URL to File
export const createFileFromUrl = async (url: string): Promise<File | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'image.png', { type: 'image/png' });
  } catch (error) {
    console.error('Error converting URL to File:', error);
    return null;
  }
};
