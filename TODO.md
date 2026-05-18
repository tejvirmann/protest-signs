# Protest Signs — TODO

## ⚡ TOP PRIORITY

### Bundle Pricing for Bag Signs (not built)
- Bag signs have tiered pricing: 1=$14.99, 2=$19.99, 3=$24.99, 4=$29.99, 7=$34.99, 8=$39.99, +$5 each after
- Currently each bag is listed individually at $14.99 — no bundle discount is applied
- Need a custom quantity-based pricing UI on the bag sign product page
- At checkout, recalculate total based on how many bag signs are in the cart combined
- Stripe line item price would need to be dynamically set based on total bag count
- Group fundraiser pricing: 50 bags=$195, 100 bags=$295 (probably manual/contact-us flow)

---

## Email Branding

### Rebrand auth emails (not done)
- Supabase sends password reset / email confirmation emails with "Supabase" in the sender name and link
- Fix in Supabase dashboard → Authentication → Email Templates
  - Update "From" name to "Protest Signs"
  - Update subject lines (e.g. "Reset your Protest Signs password")
  - Update body copy to remove Supabase branding
- For custom domain sending (so email comes from @protestsigns.com not @supabase.co): set up custom SMTP in Supabase → Settings → Auth → SMTP (already using Resend, can configure this there)

---

## Auth & Roles

### Owner Role (not built)
- Add `is_owner` boolean column to `profiles` table
- Owner has all admin powers plus: can grant/revoke admin, cannot be demoted by anyone
- Only a direct DB action or the owner themselves can remove the owner flag
- **DB migration needed:**
  ```sql
  ALTER TABLE profiles ADD COLUMN is_owner BOOLEAN DEFAULT false;
  UPDATE profiles SET is_owner = true WHERE email = 'your-email@here.com';
  ```
- **UI needed:**
  - Admin → Users page (`/admin/users`) showing all users, their roles
  - Owner can toggle `is_admin` on/off for other users
  - Owner cannot see a "demote" button for themselves
  - Admins cannot see the Users management page at all

### View & Manage Admins (not built)
- No UI exists to see who is an admin — currently must use Supabase SQL editor
- Build `/admin/users` page listing all users with role badges
- Allow owner to promote/demote admins from UI

### Guest Checkout (not built)
- Currently checkout requires a logged-in account (returns 401 if not signed in)
- Need to remove auth requirement from `/api/stripe/checkout/route.ts`
- Store guest email on the order instead of `user_id`
- Guest orders should still record in `orders` table with `user_id = null`

---

## Stripe

### Switch to Different Stripe Account
- Replace keys in `.env.local`:
  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- Create new webhook endpoint in Stripe dashboard → Developers → Webhooks
- Point it to: `https://your-domain.com/api/stripe/webhook`
- Locally: use Stripe CLI → `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- The CLI will output a `whsec_...` secret to put in `.env.local`

---

## Listings

### Add More Listings (not done)
- Create a product doc (text/JSON) with each sign's: title, description, price, tags, image URLs
- Convert to SQL seed script and insert into Supabase `signs` table
- Assign tags via `sign_tags` junction table

---

## Homepage

### Update Homepage
- Review current homepage layout and content
- Add/update featured signs section
- Update copy, hero text, and categories shown
- Ensure homepage reflects current product catalog

---

## Future / Nice to Have
- Bulk actions in admin (archive multiple signs at once)
- Low stock email alerts
- Order fulfillment / shipping label printing
- CSV export of orders
- Analytics dashboard (sales, popular signs)
- Image upload directly in admin (currently requires external URL)
