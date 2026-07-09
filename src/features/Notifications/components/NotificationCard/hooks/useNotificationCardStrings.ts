/** Copy for a single notification row. */
export const useNotificationCardStrings = () => {
  return {
    created: (userName: string, documentTitle: string) =>
      `${userName} created "${documentTitle}"`,
  };
};
