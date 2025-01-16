const shortenString = (addr: string) => addr?.slice(0, 9) + "..." + addr?.slice(-5);

export { shortenString };
