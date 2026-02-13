-- ============================================
-- PROTEST SIGNS MARKETPLACE - SEED DATA
-- ============================================
-- This file populates the database with sample signs and categories
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CREATE TAGS/CATEGORIES
-- ============================================

INSERT INTO tags (name, slug, show_on_homepage, homepage_order) VALUES
('Climate Action', 'climate-action', true, 1),
('Social Justice', 'social-justice', true, 2),
('Workers'' Rights', 'workers-rights', true, 3),
('Human Rights', 'human-rights', true, 4),
('Education', 'education', true, 5),
('Healthcare', 'healthcare', true, 6),
('Democracy', 'democracy', false, 7),
('Peace', 'peace', false, 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. CREATE SIGNS (Using actual images from public/signs/)
-- ============================================

-- Signs using images from public/signs/ folder
INSERT INTO signs (title, description, price, images, quantity_available) VALUES
(
  'FIGHT FOR YOUR RIGHTS',
  'Bold, impactful sign with powerful messaging. Perfect for rallies and demonstrations. Made with weather-resistant materials that last through rain or shine. Large format for maximum visibility.',
  2499,
  ARRAY['/signs/one.png'],
  45
),
(
  'STAND UP SPEAK OUT',
  'Classic protest sign design with clear, bold lettering. Durable construction ensures your message stays strong throughout any event. Ideal for marches, rallies, and public demonstrations.',
  2299,
  ARRAY['/signs/two.png'],
  50
)
ON CONFLICT DO NOTHING;

-- Additional example signs with placeholder images
INSERT INTO signs (title, description, price, images, quantity_available) VALUES
(
  'THERE IS NO PLANET B',
  'Essential climate action sign with bold typography. Perfect for climate marches and environmental rallies. Weatherproof materials ensure longevity. 18" x 24" size for optimal visibility.',
  2499,
  ARRAY['https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800'],
  60
),
(
  'CLIMATE JUSTICE NOW',
  'Professional-grade protest sign for climate activism. Features high-contrast design for maximum impact. Waterproof coating protects against all weather conditions. Lightweight yet durable.',
  2299,
  ARRAY['https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=800'],
  55
),
(
  'THE OCEANS ARE RISING AND SO ARE WE',
  'Powerful statement for climate demonstrations. Large 24" x 36" format ensures your voice is heard. Made from recycled materials - practice what you preach! Weather-resistant laminate coating.',
  2699,
  ARRAY['https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800'],
  40
),
(
  'BLACK LIVES MATTER',
  'Classic BLM protest sign with bold, clear lettering. Premium materials ensure durability during extended protests. Available in multiple sizes. Shows solidarity with the movement for racial justice.',
  1999,
  ARRAY['https://images.unsplash.com/photo-1591035897819-f4bdf739f446?w=800'],
  100
),
(
  'NO JUSTICE, NO PEACE',
  'Iconic protest chant transformed into powerful visual statement. High-visibility design with contrasting colors. Sturdy construction withstands hours of marching. 18" x 24" standard size.',
  2199,
  ARRAY['https://images.unsplash.com/photo-1588974163563-28ffa1c15b57?w=800'],
  75
),
(
  'EQUALITY FOR ALL',
  'Universal message of inclusion and justice. Suitable for multiple causes and movements. Clean, professional design with bold typography. Weather-resistant coating for outdoor use.',
  2399,
  ARRAY['https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800'],
  65
),
(
  'SILENCE = VIOLENCE',
  'Powerful statement encouraging activism and advocacy. Bold design commands attention. Perfect for human rights demonstrations. Durable materials withstand extended outdoor use.',
  2099,
  ARRAY['https://images.unsplash.com/photo-1573152143286-0c422b4d2175?w=800'],
  50
),
(
  'WORKERS UNITED WILL NEVER BE DIVIDED',
  'Classic labor movement slogan for union rallies and strikes. Extra-large format (24" x 36") for crowd visibility. Reinforced edges prevent tearing. Made in union facilities.',
  2599,
  ARRAY['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'],
  45
),
(
  'FAIR WAGES NOW',
  'Direct call to action for workers'' rights. Clean, impactful design gets message across clearly. Ideal for labor demonstrations and picket lines. Lightweight design reduces fatigue.',
  2099,
  ARRAY['https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800'],
  60
),
(
  'HEALTHCARE IS A HUMAN RIGHT',
  'Advocate for universal healthcare with this powerful sign. Clear messaging resonates across political divides. Professional printing ensures crisp, readable text. 18" x 24" standard size.',
  2299,
  ARRAY['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800'],
  55
),
(
  'EDUCATION NOT INCARCERATION',
  'Support education reform and criminal justice with this dual-message sign. Bold contrasting text. Perfect for education advocacy rallies. Durable materials for repeated use.',
  2399,
  ARRAY['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'],
  40
),
(
  'PROTECT OUR SCHOOLS',
  'Defend public education with this clear call to action. Large lettering visible from distance. Ideal for school board meetings and education rallies. Weather-resistant construction.',
  2199,
  ARRAY['https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800'],
  50
),
(
  'SCIENCE IS REAL',
  'Support evidence-based policy with this straightforward message. Clean design with bold typography. Perfect for science marches and climate rallies. Waterproof coating.',
  1999,
  ARRAY['https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800'],
  70
),
(
  'VOTE',
  'Simple, powerful call to democratic participation. Minimalist design with maximum impact. Non-partisan message encourages civic engagement. Available in multiple color schemes.',
  1799,
  ARRAY['https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800'],
  90
),
(
  'PROTECT VOTING RIGHTS',
  'Defend democracy with this essential message. Clear, bold lettering ensures visibility. Perfect for voting rights demonstrations. Sturdy construction for repeated use.',
  2299,
  ARRAY['https://images.unsplash.com/photo-1569132651619-90150c4fe939?w=800'],
  45
),
(
  'WOMEN''S RIGHTS ARE HUMAN RIGHTS',
  'Classic feminist statement for marches and rallies. Powerful message transcends generations. Professional quality printing. Weather-resistant materials. 18" x 24" format.',
  2399,
  ARRAY['https://images.unsplash.com/photo-1573152143286-0c422b4d2175?w=800'],
  65
),
(
  'MY BODY MY CHOICE',
  'Essential sign for reproductive rights demonstrations. Bold, clear messaging. Durable construction withstands weather and wear. Lightweight for comfortable carrying.',
  2199,
  ARRAY['https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800'],
  80
),
(
  'LOVE IS LOVE',
  'Celebrate equality and LGBTQ+ rights with this inclusive message. Bright, eye-catching design. Perfect for Pride events and equality marches. Water-resistant coating.',
  2099,
  ARRAY['https://images.unsplash.com/photo-1529900748742-9f200c09d26c?w=800'],
  75
),
(
  'PEACE NOT WAR',
  'Timeless anti-war message for peace demonstrations. Simple, powerful design. Large format ensures visibility. Made from sustainable materials. Suitable for all ages.',
  2199,
  ARRAY['https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800'],
  50
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. LINK SIGNS TO TAGS
-- ============================================

-- Helper function to link signs to tags by title and tag slug
-- Climate Action signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s
CROSS JOIN tags t
WHERE s.title IN (
  'THERE IS NO PLANET B',
  'CLIMATE JUSTICE NOW',
  'THE OCEANS ARE RISING AND SO ARE WE',
  'SCIENCE IS REAL'
)
AND t.slug = 'climate-action'
ON CONFLICT DO NOTHING;

-- Social Justice signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s
CROSS JOIN tags t
WHERE s.title IN (
  'BLACK LIVES MATTER',
  'NO JUSTICE, NO PEACE',
  'EQUALITY FOR ALL',
  'SILENCE = VIOLENCE',
  'FIGHT FOR YOUR RIGHTS',
  'STAND UP SPEAK OUT'
)
AND t.slug = 'social-justice'
ON CONFLICT DO NOTHING;

-- Workers' Rights signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s
CROSS JOIN tags t
WHERE s.title IN (
  'WORKERS UNITED WILL NEVER BE DIVIDED',
  'FAIR WAGES NOW'
)
AND t.slug = 'workers-rights'
ON CONFLICT DO NOTHING;

-- Human Rights signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s
CROSS JOIN tags t
WHERE s.title IN (
  'WOMEN''S RIGHTS ARE HUMAN RIGHTS',
  'MY BODY MY CHOICE',
  'LOVE IS LOVE',
  'HEALTHCARE IS A HUMAN RIGHT'
)
AND t.slug = 'human-rights'
ON CONFLICT DO NOTHING;

-- Education signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s
CROSS JOIN tags t
WHERE s.title IN (
  'EDUCATION NOT INCARCERATION',
  'PROTECT OUR SCHOOLS'
)
AND t.slug = 'education'
ON CONFLICT DO NOTHING;

-- Healthcare signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s
CROSS JOIN tags t
WHERE s.title IN (
  'HEALTHCARE IS A HUMAN RIGHT'
)
AND t.slug = 'healthcare'
ON CONFLICT DO NOTHING;

-- Democracy signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s
CROSS JOIN tags t
WHERE s.title IN (
  'VOTE',
  'PROTECT VOTING RIGHTS'
)
AND t.slug = 'democracy'
ON CONFLICT DO NOTHING;

-- Peace signs
INSERT INTO sign_tags (sign_id, tag_id, display_order)
SELECT s.id, t.id, 1
FROM signs s
CROSS JOIN tags t
WHERE s.title IN (
  'PEACE NOT WAR'
)
AND t.slug = 'peace'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check what was created
SELECT 'Tags Created:' as info, COUNT(*) as count FROM tags
UNION ALL
SELECT 'Signs Created:', COUNT(*) FROM signs
UNION ALL
SELECT 'Sign-Tag Links:', COUNT(*) FROM sign_tags;

-- View signs by category
SELECT
  t.name as category,
  COUNT(st.sign_id) as sign_count
FROM tags t
LEFT JOIN sign_tags st ON t.id = st.tag_id
GROUP BY t.name, t.homepage_order
ORDER BY t.homepage_order;

-- ============================================
-- DONE!
-- ============================================
-- Your store now has 20+ signs across 8 categories
-- Visit /admin/signs to manage them
-- Homepage will show signs from categories marked "show_on_homepage"
