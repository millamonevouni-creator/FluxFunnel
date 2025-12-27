// This file is a workaround to silence IDE errors when the Deno CLI is not installed.

declare namespace Deno {
    export const env: {
        get(key: string): string | undefined;
    };
}

declare module "std/http/server.ts" {
    export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "stripe" {
    const Stripe: any;
    export default Stripe;
}

declare namespace Stripe {
    type Invoice = any;
    type Subscription = any;
}

declare module "@supabase/supabase-js" {
    export const createClient: any;
}
