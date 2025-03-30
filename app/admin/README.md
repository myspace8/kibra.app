# Notes
- File Deletion: The deleteBook action doesn’t remove files from Supabase Storage (book-covers and book-pdfs). If you want to clean up unused files, you’d need to:
Store the file paths in the book record.
Add logic to deleteBook to delete the files from storage before removing the database record.
- Error Handling: Basic error handling is included with toast notifications. Enhance it if needed (e.g., retry logic).
- Dynamic Rendering: If you prefer dynamic rendering over static generation, add export const dynamic = "force-dynamic" to page.tsx.

# Additional Considerations
- Dynamic Categories: If you want categories to come from a Supabase table, create a categories table and fetch them in a server action, then pass them to the dialogs as props.
- Download Tracking: To increment downloads, you’ll need a server action triggered by the "Download" button (e.g., incrementDownloads)
- UI Layout: The dialogs are getting crowded. You might want to reorganize fields (e.g., move author and category to the left column) for better usability.

# Features
- Adding search/filter functionality
- Interesting Quotes from books, displayed at the top