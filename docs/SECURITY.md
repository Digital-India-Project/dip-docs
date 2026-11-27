# DIP Docs — Security Policy

## 1. Content classification

- Public: approved product and developer information.
- Partner: approved integration material for authenticated partners.
- Internal: architecture, operational procedures and non-public service details.
- Restricted: secrets, credentials, customer records and sensitive security details; do not store in this repository.

## 2. Prohibited content

Never publish or commit:
- Passwords, tokens, private keys or credentials.
- Customer identity documents or personal data.
- Payment details or provider secrets.
- Unredacted production logs or database exports.
- Private endpoints or infrastructure details not approved for the audience.
- Vulnerability exploit details before coordinated remediation.

## 3. Access control

- Internal content must be protected by repository/site access controls.
- Do not rely on hidden links or obscure URLs.
- Review permissions when staff/partner roles change.
- Keep public and internal content separated.
- Do not embed privileged content in public static assets.

## 4. Examples and screenshots

- Use synthetic data.
- Redact identifiers, email addresses, phone numbers and transaction IDs.
- Avoid real customer applications or documents.
- Keep sample API keys visibly fake and nonfunctional.
- Do not include live environment variables.

## 5. Supply chain and CI

- Use least-privilege workflow permissions.
- Do not expose secrets to untrusted PR code.
- Review third-party actions and dependencies.
- Scan content for accidental secrets.
- Preview builds must not publish publicly by default.
- No production deploy from review branches.

## 6. Accuracy and trust

- Label proposed functionality as planned.
- Do not describe private assistance services as government services.
- Do not claim a government endorsement or official status.
- Keep terms, privacy and service claims approved by the business owner.
- Do not publish operational instructions that could expose security controls.

## 7. Incident response

If sensitive content is committed:
1. Stop further publication.
2. Notify the content/security owner.
3. Remove access or unpublish through approved process.
4. Rotate exposed credentials through authorized owners if necessary.
5. Assess cached copies and repository history.
6. Record corrective actions.

Do not independently change production credentials or public DNS.
