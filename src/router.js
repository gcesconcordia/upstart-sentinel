// An example 'toy' implementation of a router using URLPattern: https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
// If you're interested in more production-ready routing, you may want to check out one of the following:

// itty-router: https://www.npmjs.com/package/itty-router
// Hono: https://www.npmjs.com/package/hono

class Router {
	routes = [];
	env = {};

	handle(request, env) {
		this.env = env;
		for (const route of this.routes) {
			const match = route[0](request);
			if (match) {
				return route[1]({ ...match, request });
			}
		}
		const match = this.routes.find(([matcher]) => matcher(request));
		if (match) {
			return match[1](request);
		}
	}

	register(handler, path, method) {
		const urlPattern = new URLPattern({ pathname: path });
		this.routes.push([
			(request) => {
				if (method === undefined || request.method.toLowerCase() === method) {
					const match = urlPattern.exec({
						pathname: new URL(request.url).pathname,
					});
					if (match) {
						return { params: match.pathname.groups };
					}
				}
			},
			(args) => handler(args),
		]);
	}

	options(path, handler) {
		this.register(handler, path, "options");
	}
	head(path, handler) {
		this.register(handler, path, "head");
	}
	get(path, handler) {
		this.register(handler, path, "get");
	}
	post(path, handler) {
		this.register(handler, path, "post");
	}
	put(path, handler) {
		this.register(handler, path, "put");
	}
	patch(path, handler) {
		this.register(handler, path, "patch");
	}
	delete(path, handler) {
		this.register(handler, path, "delete");
	}

	all(path, handler) {
		this.register(handler, path);
	}
}

// Setting up our application:

const router = new Router();

// POST to the collection (we'll use async here)
router.post("/webhook", async ({ request }) => {
	const FORM_ID = "fqns40qs"

	const env = router.env

	const typeform_api_url = `https://api.typeform.com/forms/${FORM_ID}/responses`;

	const options = {
		method: 'GET',
		headers: {
			Authorization: `BEARER ${env.TYPEFORM_PAT}`,
			'Content-Type': 'application/json'
		}
	}


	const num_of_responses = await (await fetch(typeform_api_url, options)).json()

	// console.log(num_of_responses["items"][0]["answers"][8]["email"])

	const slack_api_response = await (await fetch("https://slack.com/api/conversations.list", {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${env.SLACK_API_KEY}`
		}
	})).json()

	const slack_target_channel = slack_api_response["channels"].find(c => c.name_normalized === "tech-kitchen-sink")["id"];

	const slack_notif_msg = {
		channel: slack_target_channel,
		blocks: [
			{
				type: "section",
				text: {
					"type": "mrkdwn",
					"text": `*Typeform Registration Update*: New application *#${num_of_responses["total_items"]}*.`
				}
			},
		]
	}

	// console.log("Slack API Response:", slack_target_channel);

	async function post_to_slack() {
		try {
		  const result = await fetch("https://slack.com/api/chat.postMessage", {
			method: 'POST',
			headers: {
			  Authorization: `Bearer ${env.SLACK_API_KEY}`,
			  "Content-Type": "application/json"
			},
			body: JSON.stringify(slack_notif_msg)
		  });

		  if (!result.ok) {
			throw new Error(`Slack API error: ${result.statusText}`);
		  }

		  const response_data = await result.json();
		  return new Response(response_data, { headers: { "Content-Type": "text/html" }, status: 200 });
		//   console.log(responseData);
		} catch (error) {
		  console.error("Error posting to Slack:", error);
		  return new Response("Failed to post to slack", {headers: {"Content-Type": "application/json"}, status: 400 })
		}
	  }

	await post_to_slack()

	return new Response("Successfully posted to Slack.")

});

// 404 for everything else
router.all("*", () => new Response("Not Found.", { status: 404 }));

export default router;
