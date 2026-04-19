# NocoDB to MySQL Migration Plan

## Database: clearfork-insurance

## Current Analysis
- **NocoDB Usage**: Only WRITES quote form data (no reads)
- **Data**: 23-field insurance quote submissions
- **Endpoint**: `/api/quote-submit/route.ts`
- **No data migration needed**: App doesn't read historical quotes

## Migration Steps

### 1. Add MySQL Dependencies
- Install `mysql2` package for MySQL connectivity
- Update package.json

### 2. Create Database Schema
- Create `quotes` table with 25 fields (23 form + id + timestamps)
- SQL schema matching NocoDB field structure
- Run via phpMyAdmin or MySQL command

### 3. Create Database Connection
- Add `src/lib/database.ts` - MySQL connection utility
- Environment variable integration
- Connection pooling and error handling

### 4. Refactor Quote Submission API
- Replace NocoDB API calls in `/api/quote-submit/route.ts`
- Direct MySQL INSERT operations
- Maintain same request/response format
- Keep reCAPTCHA validation

### 5. Testing
- Test quote form submission locally
- Verify data storage in MySQL
- Error handling validation

## Content Pages (No Changes Needed)
- **Blogs**: Static MDX files (no database)
- **Videos**: YouTube embeds (no database) 
- **Podcasts**: RSS feeds (no database)
- **Get Quote Form**: Only submission changes

## Implementation Priority
1. Dependencies & Schema ✓ (Next)
2. Database Connection ✓
3. API Refactor ✓
4. Testing ✓

**Status**: Ready to implement