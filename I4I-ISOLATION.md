# Campus Common deployment boundaries

The hosted workspace uses its own Worker and D1 database. Keep application data and credentials scoped to their environment. The production configuration is `wrangler.i4i.jsonc`. Configure Outlook, Workers AI and push credentials for the intended environment, and verify scheduled triggers separately before relying on scheduled delivery.
