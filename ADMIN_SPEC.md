# Admin Actions Specification

## Overview
This document outlines all administrative actions available in the Protest Signs marketplace admin panel.

## Authentication & Authorization

### Admin Access Requirements
- User must have `is_admin = true` in the `profiles` table
- Admin access is checked in the admin layout
- Non-admin users are redirected to home page

### Setting Up an Admin User
```sql
-- Make a user an admin
UPDATE profiles
SET is_admin = true
WHERE id = 'user-uuid-here';
```

---

## Admin Actions by Section

### 1. Dashboard Actions (`/admin`)

| Action | Description | Permissions |
|--------|-------------|-------------|
| View Dashboard | See overview of signs, tags, orders, messages | Admin only |
| Navigate to Sections | Quick links to all admin areas | Admin only |

---

### 2. Sign Management (`/admin/signs`)

#### View All Signs
- **Route**: `/admin/signs`
- **Method**: GET
- **Action**: Display all signs in table format
- **Data Shown**: Image, Title, Price, Stock, Status
- **Permissions**: Admin only

#### Create New Sign
- **Route**: `/admin/signs/new`
- **Method**: POST
- **Required Fields**:
  - `title` (string): Sign title
  - `description` (text): Detailed description
  - `price` (integer): Price in cents
  - `images` (array): Array of image URLs
  - `quantity_available` (integer): Stock count

- **Optional Fields**:
  - `archived_at` (timestamp): When sign was archived (null = active)

- **Database Actions**:
  ```sql
  INSERT INTO signs (title, description, price, images, quantity_available)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
  ```

- **Validation Rules**:
  - Title: Required, 1-200 characters
  - Price: Required, must be positive integer
  - Images: Must be valid array of URLs
  - Quantity: Required, must be >= 0

#### Edit Sign
- **Route**: `/admin/signs/[id]/edit`
- **Method**: PUT/PATCH
- **Action**: Update existing sign details
- **Editable Fields**: All sign fields except `id`, `created_at`
- **Database Actions**:
  ```sql
  UPDATE signs
  SET title = $1, description = $2, price = $3,
      images = $4, quantity_available = $5
  WHERE id = $6;
  ```

#### Archive Sign
- **Action**: Soft delete a sign
- **Database Actions**:
  ```sql
  UPDATE signs
  SET archived_at = NOW()
  WHERE id = $1;
  ```
- **Effect**: Sign no longer appears on storefront but remains in database

#### Restore Sign
- **Action**: Unarchive a sign
- **Database Actions**:
  ```sql
  UPDATE signs
  SET archived_at = NULL
  WHERE id = $1;
  ```

---

### 3. Tag Management (`/admin/tags`)

#### View All Tags
- **Route**: `/admin/tags`
- **Method**: GET
- **Action**: Display all categories/tags
- **Data Shown**: Name, Slug, Homepage Display Status, Order

#### Create New Tag
- **Route**: `/admin/tags/new`
- **Method**: POST
- **Required Fields**:
  - `name` (string): Display name
  - `slug` (string): URL-friendly identifier

- **Optional Fields**:
  - `show_on_homepage` (boolean): Display on homepage (default: false)
  - `homepage_order` (integer): Display order (default: 0)

- **Database Actions**:
  ```sql
  INSERT INTO tags (name, slug, show_on_homepage, homepage_order)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
  ```

- **Validation Rules**:
  - Name: Required, 1-100 characters
  - Slug: Required, lowercase, hyphens only, unique
  - Homepage Order: Integer >= 0

#### Edit Tag
- **Route**: `/admin/tags/[id]/edit`
- **Method**: PUT/PATCH
- **Action**: Update tag details
- **Editable Fields**: name, slug, show_on_homepage, homepage_order

#### Delete Tag
- **Action**: Remove a tag (cascade removes sign_tags associations)
- **Database Actions**:
  ```sql
  DELETE FROM tags WHERE id = $1;
  ```
- **Warning**: This removes tag from all associated signs

#### Assign Tags to Signs
- **Action**: Link signs to categories
- **Database Actions**:
  ```sql
  INSERT INTO sign_tags (sign_id, tag_id, display_order)
  VALUES ($1, $2, $3);
  ```

#### Remove Tag from Sign
- **Database Actions**:
  ```sql
  DELETE FROM sign_tags
  WHERE sign_id = $1 AND tag_id = $2;
  ```

---

### 4. Order Management (`/admin/orders`)

#### View All Orders
- **Route**: `/admin/orders`
- **Method**: GET
- **Action**: Display all customer orders
- **Data Shown**:
  - Order ID
  - Customer email
  - Items ordered
  - Total amount
  - Status
  - Created date

- **Database Query**:
  ```sql
  SELECT o.*, u.email,
         json_agg(oi.*) as items
  FROM orders o
  LEFT JOIN profiles u ON o.user_id = u.id
  LEFT JOIN order_items oi ON o.id = oi.order_id
  GROUP BY o.id, u.email
  ORDER BY o.created_at DESC;
  ```

#### View Order Details
- **Route**: `/admin/orders/[id]`
- **Action**: View detailed order information
- **Includes**:
  - Customer details
  - Shipping information
  - Line items with prices
  - Payment status
  - Stripe session ID

#### Update Order Status
- **Action**: Change order status
- **Allowed Statuses**:
  - `pending`: Order placed, awaiting processing
  - `completed`: Payment successful
  - `shipped`: Order shipped
  - `cancelled`: Order cancelled

- **Database Actions**:
  ```sql
  UPDATE orders
  SET status = $1
  WHERE id = $2;
  ```

---

### 5. Inventory Management

#### Adjust Stock
- **Action**: Manually adjust inventory levels
- **Database Actions**:
  ```sql
  UPDATE signs
  SET quantity_available = $1
  WHERE id = $2;
  ```

#### Low Stock Alert
- **Query**: Find signs with low inventory
  ```sql
  SELECT * FROM signs
  WHERE quantity_available <= 5
  AND archived_at IS NULL;
  ```

---

### 6. Content Management

#### View Contact Submissions
- **Route**: `/admin/messages` (future)
- **Action**: View contact form submissions
- **Database Query**:
  ```sql
  SELECT * FROM contact_submissions
  ORDER BY created_at DESC;
  ```

---

## Security Considerations

### Row Level Security (RLS)
All admin actions must respect RLS policies:

```sql
-- Only admins can manage signs
CREATE POLICY "Admin can manage signs"
ON signs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
```

### Input Validation
- All user inputs must be sanitized
- Price values must be validated (positive integers)
- URLs must be validated for image uploads
- Slugs must be URL-safe

### Audit Trail
Consider adding audit logs:
```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action VARCHAR(50),
  resource VARCHAR(50),
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Common Admin Workflows

### 1. Adding a New Product
1. Navigate to `/admin/signs/new`
2. Fill in product details
3. Upload/add image URLs
4. Set initial quantity
5. Assign to relevant tags
6. Click "Create Sign"

### 2. Managing Inventory
1. Go to `/admin/signs`
2. Review stock levels
3. Edit sign to adjust quantity
4. Archive out-of-stock items if needed

### 3. Processing Orders
1. View new orders at `/admin/orders`
2. Check order details
3. Update status as order progresses
4. Mark as shipped when complete

### 4. Organizing Categories
1. Create tags at `/admin/tags/new`
2. Set homepage display preferences
3. Assign order for homepage display
4. Link signs to tags via sign edit page

---

## API Endpoints (Future)

For headless/API access, consider these endpoints:

### Signs API
- `GET /api/admin/signs` - List all signs
- `POST /api/admin/signs` - Create sign
- `PUT /api/admin/signs/[id]` - Update sign
- `DELETE /api/admin/signs/[id]` - Archive sign

### Tags API
- `GET /api/admin/tags` - List all tags
- `POST /api/admin/tags` - Create tag
- `PUT /api/admin/tags/[id]` - Update tag
- `DELETE /api/admin/tags/[id]` - Delete tag

### Orders API
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/orders/[id]` - Get order details
- `PATCH /api/admin/orders/[id]` - Update order status

---

## Database Schema Reference

### Signs Table
```sql
CREATE TABLE signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  quantity_available INTEGER NOT NULL DEFAULT 0,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tags Table
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  show_on_homepage BOOLEAN DEFAULT false,
  homepage_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Sign_Tags Junction Table
```sql
CREATE TABLE sign_tags (
  sign_id UUID REFERENCES signs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  PRIMARY KEY (sign_id, tag_id)
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  stripe_session_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Order_Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sign_id UUID REFERENCES signs(id),
  quantity INTEGER NOT NULL,
  price_at_purchase INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Performance Considerations

### Indexing
Ensure proper indexes for admin queries:
```sql
CREATE INDEX idx_signs_archived ON signs(archived_at);
CREATE INDEX idx_tags_homepage ON tags(show_on_homepage, homepage_order);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX idx_sign_tags_tag ON sign_tags(tag_id);
```

### Caching
- Cache tag lists (rarely change)
- Cache homepage featured signs
- Invalidate cache on admin updates

---

## Future Enhancements

1. **Bulk Actions**: Select multiple signs to update/archive
2. **CSV Export**: Export orders/signs to CSV
3. **Analytics Dashboard**: Sales metrics, popular signs
4. **Image Upload**: Direct upload to Supabase Storage
5. **Scheduled Publishing**: Set future publish dates
6. **Inventory Alerts**: Email when stock is low
7. **Order Fulfillment**: Print shipping labels
8. **Customer Management**: View customer history
