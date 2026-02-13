# 📋 Admin Panel Guide

## How to Access Admin Panel

1. **Login as Admin**: Go to `/auth/login`
2. **Access Admin Dashboard**: Navigate to `/admin`

> **Note**: You need to be marked as admin in the database. Set `is_admin = true` in your Supabase `profiles` table.

---

## Admin Panel Sections

### 1. 🏠 **Admin Dashboard** (`/admin`)

**Purpose**: Overview and quick navigation

**What You See**:
- Stats cards for Signs, Tags, Orders, Messages
- Quick action buttons to navigate to main sections

**Quick Actions**:
- View All Signs
- Create New Sign
- Manage Tags
- View Orders

---

### 2. 📦 **Manage Signs** (`/admin/signs`)

**Purpose**: View and manage all protest signs

**Features**:
- **Table view** showing:
  - Image thumbnail
  - Title
  - Price
  - Stock quantity
  - Status (Active/Archived)
- **Edit button** for each sign
- **Create New Sign** button

**Actions**:
- Click "Create New Sign" to add a new sign
- Click edit icon to modify existing signs
- View sign details at a glance

---

### 3. ➕ **Create New Sign** (`/admin/signs/new`)

**Purpose**: Add new protest signs to your store

**Form Fields**:
1. **Title**: Name of the sign
2. **Description**: Details about the sign
3. **Price**: Cost in cents (e.g., 2999 = $29.99)
4. **Images**: Upload sign images (supports Supabase storage or URLs)
5. **Quantity Available**: Stock count
6. **Tags**: Assign categories (Climate, Social Justice, etc.)

**Steps to Add a Sign**:
1. Click "Create New Sign"
2. Fill in all required fields
3. Upload images (or provide image URLs)
4. Select relevant tags/categories
5. Click "Create Sign"

---

### 4. 🏷️ **Manage Tags** (`/admin/tags`)

**Purpose**: Create and manage categories for signs

**Features**:
- View all existing tags
- Create new tags
- Edit tag details
- Set which tags show on homepage

**Tag Fields**:
- **Name**: Display name (e.g., "Climate Action")
- **Slug**: URL-friendly version (e.g., "climate-action")
- **Show on Homepage**: Toggle to display category on homepage
- **Homepage Order**: Order of appearance (lower = appears first)

**Steps to Create a Tag**:
1. Go to `/admin/tags`
2. Click "Create New Tag"
3. Enter name and slug
4. Toggle "Show on Homepage" if you want it featured
5. Set homepage order number
6. Save

---

### 5. 📦 **View Orders** (`/admin/orders`)

**Purpose**: Track customer orders

**What You See**:
- Order ID
- Customer details
- Items ordered
- Total amount
- Order status
- Timestamp

---

## 🎨 Sample Signs to Add

Here are some example protest signs you can add to populate your store:

### Climate Action Category

1. **"THERE IS NO PLANET B"**
   - Price: $24.99
   - Description: Bold statement for climate marches
   - Tags: Climate Action

2. **"CLIMATE JUSTICE NOW"**
   - Price: $22.99
   - Description: Professional waterproof sign
   - Tags: Climate Action

3. **"THE OCEANS ARE RISING AND SO ARE WE"**
   - Price: $26.99
   - Description: Large format, weather-resistant
   - Tags: Climate Action

### Social Justice Category

4. **"BLACK LIVES MATTER"**
   - Price: $19.99
   - Description: Classic design, durable materials
   - Tags: Social Justice

5. **"NO JUSTICE, NO PEACE"**
   - Price: $21.99
   - Description: Bold lettering on weatherproof material
   - Tags: Social Justice

6. **"EQUALITY FOR ALL"**
   - Price: $23.99
   - Description: Inclusive message for all causes
   - Tags: Social Justice

### Workers' Rights Category

7. **"WORKERS UNITED WILL NEVER BE DIVIDED"**
   - Price: $24.99
   - Description: Union-friendly messaging
   - Tags: Workers' Rights

8. **"FAIR WAGES NOW"**
   - Price: $20.99
   - Description: Clear, impactful message
   - Tags: Workers' Rights

---

## 📊 How to Add Sample Data via Supabase

### Step 1: Create Tags

Go to your Supabase SQL Editor and run:

\`\`\`sql
-- Create tags
INSERT INTO tags (name, slug, show_on_homepage, homepage_order) VALUES
('Climate Action', 'climate-action', true, 1),
('Social Justice', 'social-justice', true, 2),
('Workers'' Rights', 'workers-rights', true, 3),
('Human Rights', 'human-rights', true, 4);
\`\`\`

### Step 2: Add Sample Signs

\`\`\`sql
-- Add signs (using placeholder image URLs - replace with real images)
INSERT INTO signs (title, description, price, images, quantity_available) VALUES
('THERE IS NO PLANET B', 'Bold statement for climate marches. Weatherproof, durable materials.', 2499, ARRAY['https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800'], 50),
('CLIMATE JUSTICE NOW', 'Professional waterproof sign perfect for rallies and marches.', 2299, ARRAY['https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=800'], 45),
('THE OCEANS ARE RISING AND SO ARE WE', 'Large format, weather-resistant sign with bold messaging.', 2699, ARRAY['https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800'], 30),
('BLACK LIVES MATTER', 'Classic design with durable, long-lasting materials.', 1999, ARRAY['https://images.unsplash.com/photo-1591035897819-f4bdf739f446?w=800'], 100),
('NO JUSTICE, NO PEACE', 'Bold lettering on weatherproof material for maximum visibility.', 2199, ARRAY['https://images.unsplash.com/photo-1588974163563-28ffa1c15b57?w=800'], 75),
('EQUALITY FOR ALL', 'Inclusive message suitable for multiple causes and movements.', 2399, ARRAY['https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800'], 60),
('WORKERS UNITED', 'Union-friendly messaging for labor rallies and demonstrations.', 2499, ARRAY['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'], 40),
('FAIR WAGES NOW', 'Clear, impactful message for workers'' rights movements.', 2099, ARRAY['https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800'], 55);
\`\`\`

### Step 3: Link Signs to Tags

\`\`\`sql
-- Get tag IDs and sign IDs, then link them
-- Climate Action signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s, tags t
WHERE s.title IN ('THERE IS NO PLANET B', 'CLIMATE JUSTICE NOW', 'THE OCEANS ARE RISING AND SO ARE WE')
AND t.slug = 'climate-action';

-- Social Justice signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s, tags t
WHERE s.title IN ('BLACK LIVES MATTER', 'NO JUSTICE, NO PEACE', 'EQUALITY FOR ALL')
AND t.slug = 'social-justice';

-- Workers' Rights signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s, tags t
WHERE s.title IN ('WORKERS UNITED', 'FAIR WAGES NOW')
AND t.slug = 'workers-rights';
\`\`\`

---

## 🎨 Getting Real Images

**Option 1: Free Stock Photos**
- Unsplash (https://unsplash.com)
- Pexels (https://pexels.com)
- Search for "protest", "activism", "signs"

**Option 2: Upload to Supabase Storage**
1. Go to Supabase Dashboard → Storage
2. Create a bucket called `signs`
3. Upload images
4. Get public URLs
5. Use those URLs in the `images` array

**Option 3: Create Custom Signs**
- Use Canva or Photoshop to create sign graphics
- Upload to Supabase Storage
- Reference in your signs

---

## 🚀 Workflow Summary

### To Launch Your Store:

1. **Set up Admin Access**
   - Mark your user as admin in Supabase

2. **Create Categories (Tags)**
   - Go to `/admin/tags/new`
   - Create: Climate Action, Social Justice, Workers' Rights, etc.
   - Enable "Show on Homepage"

3. **Add Signs**
   - Go to `/admin/signs/new`
   - Add sign details, images, price
   - Assign to categories

4. **Test the Site**
   - Visit homepage to see categories
   - Browse page to filter signs
   - Add to cart and test checkout

5. **Configure Stripe & Supabase**
   - Add environment variables to Vercel
   - Test webhook endpoints

---

## 🎯 Best Practices

1. **Image Quality**: Use high-res images (at least 800x800px)
2. **Pricing**: Keep consistent (e.g., all in $19-29 range)
3. **Inventory**: Start with reasonable quantities
4. **Descriptions**: Be clear about materials, size, durability
5. **Tags**: Use 1-3 tags per sign for better organization

---

## 📞 Need Help?

- Check the main README.md for setup instructions
- Review Supabase schema in `supabase-schema.sql`
- Test locally before pushing to production
