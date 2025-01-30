import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function updateAddresses(chainId: string, address: string  ): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const addressesPath = path.join(__dirname, '../../common/addresses.json');
  let addresses: Record<string, string> = {};

  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  }

  addresses[chainId] = address;

  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  console.log(`Address written to ${addressesPath}`);
}
