# 🚀 Quick Start Guide

## Get Your Store Running in 5 Minutes

### 1️⃣ Setup Database with Sample Data

**Option A: Run SQL Script (Recommended)**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content of `seed-data.sql`
4. Paste and click **Run**
5. ✅ Done! You now have 20+ signs across 8 categories

**Option B: Use Admin Panel**
1. Login to your site
2. Go to `/admin/tags/new` and create categories
3. Go to `/admin/signs/new` and add signs manually

---

### 2️⃣ Make Yourself an Admin

Run this in Supabase SQL Editor (replace with your user ID):

```sql
-- First, find your user ID
SELECT id, email FROM auth.users;

-- Then make yourself admin
UPDATE profiles
SET is_admin = true
WHERE id = 'YOUR-USER-ID-HERE';
```

---

### 3️⃣ Set Environment Variables on Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
CONTACT_EMAIL=your@email.com

# Site
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

---

### 4️⃣ Deploy to Vercel

```bash
# From your project directory
git add .
git commit -m "Add seed data and improve UI"
git push origin main
```

Vercel will automatically deploy your changes!

---

## 📋 What You'll Have

After setup, your store will include:

### Categories
- ✅ Climate Action (4 signs)
- ✅ Social Justice (6 signs)
- ✅ Workers' Rights (2 signs)
- ✅ Human Rights (4 signs)
- ✅ Education (2 signs)
- ✅ Healthcare (1 sign)
- ✅ Democracy (2 signs)
- ✅ Peace (1 sign)

### Features
- ✅ Professional homepage with gradient hero
- ✅ Browse page with filters
- ✅ Working shopping cart
- ✅ Stripe checkout integration
- ✅ Admin panel for managing everything
- ✅ Real logo in navbar

---

## 🎨 Customize Your Store

### Change the Logo
- Replace `/public/logo.png` with your logo
- Keep it square (recommended: 512x512px)
- PNG with transparent background works best

### Add More Signs
1. Go to `/admin/signs/new`
2. Fill in details
3. Upload images or use URLs
4. Assign to categories

### Upload Sign Images
**To Supabase Storage:**
1. Go to Supabase Dashboard → Storage
2. Create bucket: `signs` (make it public)
3. Upload images
4. Copy public URL
5. Use URL in sign creation

**Image Requirements:**
- Format: JPG or PNG
- Size: 800x800px minimum
- Aspect Ratio: 1:1 (square) recommended
- File Size: Under 2MB

---

## 🧪 Test Everything

### Test Stripe Checkout
1. Add sign to cart
2. Proceed to checkout
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. ZIP: Any 5 digits

### Test Admin Panel
- `/admin` - Dashboard
- `/admin/signs` - Manage signs
- `/admin/signs/new` - Create new sign
- `/admin/tags` - Manage categories
- `/admin/orders` - View orders

---

## 📚 Documentation

- `README.md` - Main setup instructions
- `ADMIN_SPEC.md` - Complete admin actions reference
- `ADMIN_GUIDE.md` - How to use admin panel
- `seed-data.sql` - Database population script

---

## 🐛 Troubleshooting

### Can't see signs on homepage?
- Make sure tags have `show_on_homepage = true`
- Check that signs are linked to tags via `sign_tags` table
- Verify signs are not archived (`archived_at IS NULL`)

### Admin panel not accessible?
- Confirm `is_admin = true` in profiles table
- Make sure you're logged in
- Check browser console for errors

### Images not loading?
- Verify image URLs are accessible
- Check Supabase Storage bucket is public
- Use full URLs including `https://`

### Checkout not working?
- Verify all Stripe env variables are set
- Check webhook endpoint: `https://your-site.vercel.app/api/stripe/webhook`
- Look at Vercel deployment logs for errors

---

## 🎯 Next Steps

1. **Customize Content**: Update sign titles and descriptions
2. **Add Real Images**: Replace placeholder images with actual designs
3. **Configure Email**: Set up Resend for contact form
4. **Test Payments**: Verify Stripe integration works
5. **Go Live**: Switch Stripe from test to production mode

---

## 💡 Pro Tips

- Use Canva to create professional-looking sign graphics
- Keep prices consistent ($19.99, $24.99, $29.99, etc.)
- Write compelling descriptions highlighting durability and impact
- Add "Only X left" badges for scarcity (built-in when quantity ≤ 5)
- Group related signs with tags for better browsing
- Monitor orders in admin panel regularly

---

## 🆘 Need Help?

- Check the main `README.md` for detailed setup
- Review `ADMIN_SPEC.md` for technical reference
- Look at existing signs for formatting examples
- Test locally with `npm run dev` before deploying

---

**You're all set! Your protest signs marketplace is ready to make an impact! ✊**
