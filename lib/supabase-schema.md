## Indexes

Create indexes to improve query performance:

\`\`\`sql
-- Books indexes
CREATE INDEX idx_books_author_id ON books(author_id);
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_status ON books(status);

-- Authors index
CREATE INDEX idx_authors_slug ON authors(slug);

-- Categories index
CREATE INDEX idx_categories_slug ON categories(slug);

-- Collections index
CREATE INDEX idx_collections_slug ON collections(slug);

-- Downloads indexes
CREATE INDEX idx_downloads_book_id ON downloads(book_id);
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_downloads_created_at ON downloads(created_at);

-- Shares indexes
CREATE INDEX idx_shares_book_id ON shares(book_id);
CREATE INDEX idx_shares_user_id ON shares(user_id);
CREATE INDEX idx_shares_created_at ON shares(created_at);

-- Book collections indexes
CREATE INDEX idx_book_collections_book_id ON book_collections(book_id);
CREATE INDEX idx_book_collections_collection_id ON book_collections(collection_id);
\`\`\`

## Views

Create views to simplify common queries:

### Book Details View

\`\`\`sql
CREATE VIEW book_details AS
SELECT 
  b.id,
  b.title,
  b.slug,
  b.description,
  b.cover_image_url,
  b.pdf_url,
  b.isbn,
  b.language,
  b.publication_year,
  b.status,
  b.created_at,
  b.updated_at,
  a.id AS author_id,
  a.name AS author_name,
  a.slug AS author_slug,
  c.id AS category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  (SELECT COUNT(*) FROM downloads WHERE downloads.book_id = b.id) AS download_count,
  (SELECT COUNT(*) FROM shares WHERE shares.book_id = b.id) AS share_count
FROM 
  books b
LEFT JOIN 
  authors a ON b.author_id = a.id
LEFT JOIN 
  categories c ON b.category_id = c.id;
\`\`\`

### Book Collections View

\`\`\`sql
CREATE VIEW book_collection_details AS
SELECT 
  bc.id,
  b.id AS book_id,
  b.title AS book_title,
  b.slug AS book_slug,
  b.cover_image_url,
  c.id AS collection_id,
  c.name AS collection_name,
  c.slug AS collection_slug,
  a.name AS author_name,
  (SELECT COUNT(*) FROM downloads WHERE downloads.book_id = b.id) AS download_count
FROM 
  book_collections bc
JOIN 
  books b ON bc.book_id = b.id
JOIN 
  collections c ON bc.collection_id = c.id
LEFT JOIN 
  authors a ON b.author_id = a.id;
\`\`\`

### Author Stats View

\`\`\`sql
CREATE VIEW author_stats AS
SELECT 
  a.id,
  a.name,
  a.slug,
  a.image_url,
  COUNT(DISTINCT b.id) AS book_count,
  SUM((SELECT COUNT(*) FROM downloads WHERE downloads.book_id = b.id)) AS total_downloads,
  SUM((SELECT COUNT(*) FROM shares WHERE shares.book_id = b.id)) AS total_shares
FROM 
  authors a
LEFT JOIN 
  books b ON a.id = b.author_id
GROUP BY 
  a.id, a.name, a.slug, a.image_url;
\`\`\`

## Webhooks

Set up the following webhooks in Supabase:

1. **User Registration Webhook**: Trigger when a new user signs up to create their profile record
2. **Download Tracking Webhook**: Trigger when a download is recorded to update analytics
3. **Share Tracking Webhook**: Trigger when a share is recorded to update analytics

## Edge Functions

Create the following Edge Functions:

1. **generatePresignedUrl**: Generate temporary URLs for PDF downloads
2. **processBookCover**: Resize and optimize book cover images on upload
3. **checkAdminAccess**: Verify admin permissions for protected routes

## Implementation Steps

1. **Database Setup**:
   - Create all tables with proper relationships
   - Apply RLS policies
   - Create indexes and views

2. **Storage Configuration**:
   - Create the three storage buckets
   - Apply RLS policies to buckets
   - Set up CORS configuration for file access

3. **Authentication Setup**:
   - Configure email authentication
   - Set up admin user(s)
   - Create admin verification function

4. **API Integration**:
   - Create API endpoints for admin operations
   - Set up serverless functions for file processing
   - Implement analytics tracking

5. **Monitoring**:
   - Set up database query performance monitoring
   - Configure storage usage alerts
   - Implement error logging and tracking

By following this schema and implementation guide, you'll have a robust backend for your KIBRA platform that supports all the admin functionality while maintaining security and performance.

