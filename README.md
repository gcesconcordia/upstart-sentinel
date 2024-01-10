# Typeform Registration Notification

This small piece of software is called a web worker. You can read more about it on Cloudflare Workers documentation.

## How does it work?

1. Create a custom webhook event on Typeform and point to the designated Cloudflare Workers domain
2. The Worker acts as a webhook handler for new submission events
3. On receipt of an event, via the native Fetch API (read MSDN docs)
   1. Send authenticated GET request for the current number of applications from Typeform API
   2. Send authenticated GET request for the Slack channel ID from the Slack API
   3. Send authenticated POST request to Slack channel which will send a message as the notification app (UpStart Sentinel)

Chat gippity generated ASCII diagram for the visual learners.

```
  +-------------------------------------+
  |                                     |
  |            Typeform                 |
  |                                     |
  +-----------+-------------------------+
              |
              | 1. Create custom webhook event
              |    and point to Cloudflare Workers domain
              |
              v
  +-----------------------+
  |                       |
  |  Cloudflare Workers   |
  |                       |
  +-----------+-----------+
              |
              | 2. Webhook handler for new submission events
              |
              v
  +-----------------------+
  |                       |
  |        Worker         |
  |                       |
  +-----------+-----------+
              |
              | 3. On receipt of event via Fetch API
              |    - Send authenticated GET request for
              |      current number of applications
              |      from Typeform API
              |    - Send authenticated GET request for
              |      Slack channel ID from Slack API
              |    - Send authenticated POST request to
              |      Slack channel as UpStart Sentinel
              |
              v
  +-----------------------+
  |                       |
  |      Typeform API     |
  |                       |
  +-----------------------+
              |
              |
  +-----------------------+
  |                       |
  |      Slack API        |
  |                       |
  +-----------------------+
              |
              |
  +-----------------------+
  |                       |
  |      Slack Channel    |
  |                       |
  +-----------------------+
              |
              |
  +-----------------------+
  |                       |
  |  UpStart Sentinel App |
  |                       |
  +-----------------------+

```
