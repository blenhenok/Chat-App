import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

const validatePayload = async (
  req: Request
): Promise<WebhookEvent | undefined> => {
  const payload = await req.text();
  console.log("Received webhook payload:", payload);

  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");
  try {
    const event = webhook.verify(payload, svixHeaders) as WebhookEvent;
    console.log("Webhook validated successfully:", event.type);
    return event;
  } catch (error) {
    console.error("Error validating webhook:", error);
    return undefined;
  }
};

const handleClerkWebhook = httpAction(async (ctx, req) => {
  const event = await validatePayload(req);

  if (!event) {
    return new Response("Could not validate Clerk payload", { status: 400 });
  }

  switch (event.type) {

    case "user.created":{
		const user = await ctx.runQuery(internal.user.get, {
        clerkId: event.data.id,
      });

      if (user) {
        console.log(`updating User ${event.data.id} with:${event.data} `);
      }
}

    case "user.updated":{
		console.log("creating/updating User:", event.data.id);
      await ctx.runMutation(internal.user.create, {
        clerkId: event.data.id,
        username:
          `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim() ||
          "Unknown User",
        imageUrl: event.data.image_url || "",
        email: event.data.email_addresses[0]?.email_address || "",
      });
      break;
	}

    default:{
		console.log("Unhandled event type:",event.type);
	}
  }

  return new Response(null, { status: 200 });
});

const http = httpRouter();

http.route({
  path: "/clerk-user-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
