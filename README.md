# n8n-nodes-clerkfield

This is an n8n community node for [Clerkfield](https://clerkfield.com). It lets you verify U.S. businesses against official state registries and search UCC liens (financing statements) by business or by lender, inside your n8n workflows.

Clerkfield reads each state's own business registry and UCC filing office and returns the source and the date of the data with every result. It's built for lenders, merchant cash advance funders, brokers and fintech teams doing KYB (know your business).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Usage](#usage) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. In n8n, go to **Settings > Community Nodes**, select **Install**, and enter `n8n-nodes-clerkfield`.

## Operations

**Business**
- **Verify**: check a business by name and state of formation. Returns a `verdict` (`pass`, `review` or `fail`), `flags` explaining why (exact or close name match, active or inactive status, months in business against your minimum, whether the owner is listed), and the state's record: legal name, entity ID, status, formation date, addresses, registered agent and officers. Optional: owner name and minimum months in business (default 6).

**UCC Lien**
- **Search**: list UCC financing statements filed against a business (debtor), or every filing a lender (secured party) has made, newest first. Returns a summary (active, lapsed and terminated counts and the lenders on active filings) and each filing's file number, dates, status, parties, collateral and later amendments. Turn off **Include Lapsed and Terminated** to get active filings only.

**Coverage**
- **Get**: which states each check covers (business check, lien search, search by lender) and which fields each state doesn't publish.

Coverage differs by check. If a state isn't covered, the node returns a clear "not covered" error instead of guessed data. See [clerkfield.com/coverage](https://clerkfield.com/coverage).

The node is marked usable as a tool, so AI Agent nodes can call it.

## Credentials

1. Create a free account at [clerkfield.com/app](https://clerkfield.com/app#signup).
2. Open your profile in the app and create an API key. It starts with `cf_live_` and is shown once.
3. In n8n, create a **Clerkfield API** credential and paste the key. n8n tests it against `GET https://clerkfield.com/v1/account/me`.

The key is sent as `Authorization: Bearer <key>` to `https://clerkfield.com`. Each check counts as usage for your Clerkfield company account.

## Usage

**Verify a merchant from a form submission**

1. Trigger: a form, webhook or CRM node with the business name, state and applicant name.
2. **Clerkfield → Business → Verify** with *Business Name*, *State* and, under *Additional Fields*, *Owner Name*.
3. An **If** node on `{{ $json.verdict }}`: send `pass` on, route `review` to a person, and stop on `fail`.

**Check stacking before funding**

1. **Clerkfield → UCC Lien → Search** with *Search By: Business (Debtor)*.
2. Read `{{ $json.summary.active }}` and `{{ $json.summary.activeSecuredParties }}` to see how many active filings there are and which lenders hold them.

UCC filings don't include amounts, and a filing can stay active after a debt is paid if no termination was filed.

Clerkfield reports on businesses only and is not a consumer reporting agency: don't use results to decide an individual's eligibility for personal credit, employment, housing or insurance.

## Compatibility

Built with the n8n node CLI and tested with n8n 1.x. The node has no runtime dependencies.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Clerkfield API documentation](https://clerkfield.com/docs)
- [OpenAPI spec](https://clerkfield.com/openapi.json)
- Support: hello@clerkfield.com

## Version history

- **0.1.1**: published from GitHub Actions with npm provenance; same functionality as 0.1.0.
- **0.1.0**: first release with Business → Verify, UCC Lien → Search and Coverage → Get.
