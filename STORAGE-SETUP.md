# Supabase Storage Setup for Menu Images

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Enter the bucket name: `menu-images`
5. Set the bucket to **Public** (so images can be accessed via URL)
6. Click **Create Bucket**

## Step 2: Set Bucket Policies (Optional but Recommended)

To allow authenticated users to upload images:

1. Click on the `menu-images` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Add the following policies:

### Policy 1: Allow Public Read Access
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'menu-images' );
```

### Policy 2: Allow Authenticated Insert
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'menu-images' );
```

### Policy 3: Allow Authenticated Update
```sql
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'menu-images' );
```

### Policy 4: Allow Authenticated Delete
```sql
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'menu-images' );
```

## Alternative: Allow All Operations (For Testing)

If you want to allow all operations without authentication (use only for development):

```sql
CREATE POLICY "Allow all operations"
ON storage.objects FOR ALL
USING ( bucket_id = 'menu-images' );
```

## How to Use

1. Complete the setup above in your Supabase dashboard
2. In your MenuList component, hover over any menu item card
3. Click the **📷 Upload Image** button that appears
4. Select an image file (max 5MB)
5. The image will be uploaded and automatically displayed on the menu card

## File Naming Convention

Images are automatically named as: `menu-{menuId}-{timestamp}.{extension}`

Example: `menu-1-1704067200000.jpg`

## Image Requirements

- **File Types**: JPG, PNG, GIF, WebP
- **Max Size**: 5MB
- **Recommended Resolution**: 1200x800px or similar aspect ratio

## Troubleshooting

### "Failed to upload image: new row violates row-level security policy"
- Make sure you have created the storage policies listed above
- Check that your user is authenticated

### "Failed to upload image: Bucket not found"
- Verify that you created a bucket named exactly `menu-images`
- Check that the bucket is set to public

### Images not displaying
- Check the browser console for CORS errors
- Verify the bucket is set to **Public**
- Check that the image URL is correct in the database
