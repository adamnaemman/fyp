import { handle } from "@/lib/mutations";


export async function POST(req: Request) {
  return handle("blocked", req);
}
