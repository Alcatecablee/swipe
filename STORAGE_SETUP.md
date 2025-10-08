# Supabase Storage Setup for Resume Uploads

## Issue
The CV/resume upload feature requires a Supabase storage bucket named `resumes` to be created.

## Manual Setup (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Select your SwipeJob project

2. **Access Storage**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Configure the Bucket**
   - **Bucket name**: `resumes`
   - **Public bucket**: Toggle ON (to allow public access to resume URLs)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: 
     - application/pdf
     - application/msword
     - application/vnd.openxmlformats-officedocument.wordprocessingml.document
     - image/jpeg
     - image/png

4. **Create the Bucket**
   - Click "Create bucket"
   - The bucket is now ready for use

## Alternative: API-Based Setup

If you prefer to create the bucket programmatically, make a POST request:

```bash
curl -X POST http://localhost:5000/api/init-storage
```

This requires the `SUPABASE_SERVICE_ROLE_KEY` environment variable to be set.

## Verification

After setup, test the resume upload:
1. Go to your Profile page
2. Click "Upload Resume"
3. Select a PDF or Word document
4. The upload should complete successfully

## Troubleshooting

If you still see "Bucket not found":
- Verify the bucket name is exactly `resumes` (lowercase)
- Ensure the bucket is set to public
- Check that your Supabase credentials are correct in the environment variables
