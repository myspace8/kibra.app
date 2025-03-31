# Notes
- File Deletion: The deleteBook action doesn’t remove files from Supabase Storage (book-covers and book-pdfs). If you want to clean up unused files, you’d need to:
Store the file paths in the book record.
Add logic to deleteBook to delete the files from storage before removing the database record.
- Error Handling: Basic error handling is included with toast notifications. Enhance it if needed (e.g., retry logic).
- Dynamic Rendering: If you prefer dynamic rendering over static generation, add export const dynamic = "force-dynamic" to page.tsx.
- Uniqueness: This logs every search, even duplicates. If you want unique queries only, add a check before inserting (e.g., query against recent searches in Supabase).
- User Data: To tie searches to users, add a user_id column and fetch the user ID from your auth system (e.g., Supabase Auth).
- Rate Limiting: For high traffic, consider debouncing the search logging to avoid overwhelming Supabase.
Analytics: Use this data later for popular search terms or to improve searchBooks.


# Additional Considerations
- Download Tracking: To increment downloads, you’ll need a server action triggered by the "Download" button (e.g., incrementDownloads)
- UI Layout: The dialogs are getting crowded. You might want to reorganize fields (e.g., move author and category to the left column) for better usability.

# Features
- Interesting Quotes from books, displayed at the top
- "Add to cart" button in the book menu dropdown