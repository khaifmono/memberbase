## Packages
date-fns | Date formatting for tables and logs
framer-motion | Smooth animations for page transitions and complex UI interactions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes safely

## Notes
- Admin Auth uses standard email/password (POST /api/admin/login)
- Member Auth uses OTP flow (Request -> Verify -> Token)
- IC Numbers in Admin view should be masked (e.g., 900101-14-XXXX)
- Export endpoint returns a file download (handled via window.open or blob)
