# Requirements: Full Stack Location Management Application

Source: *Technical Assessments.pdf*, section "Full Stack Location Management Application" (pages 1–2).
This is the source of truth for **what** to build. Pages 3+ of the PDF (React Native To Do app) are **out of scope**.

## Objective
A web application where authenticated users manage and visualise **their own** location data. Locations can be added manually or through a file upload and are shown on an interactive map.

## Checklist

### Pages and navigation
- [x] R1. Four pages: user registration, login, interactive map, file upload. *Routes `/register`, `/login`, `/map`, `/upload`.*
- [x] R2. Sidebar navigation between pages. *`client/src/app/AppLayout.tsx`*
- [x] R3. Logout option in the sidebar

### Authentication and data privacy
- [x] R4. JWT-based authentication. *HS256 JWT in an httpOnly cookie, `server/src/modules/auth/`*
- [x] R5. Map and file upload pages are protected. *Client: `RequireAuth`. Server: `requireAuth` on `/api/locations`.*
- [x] R6. Unauthenticated visitors are redirected to the login page automatically
- [x] R7. Location data is per user. *Every query is scoped by the user id from the JWT; covered by an API test.*

### Interactive map
- [x] R8. Map rendered with `react-leaflet`
- [x] R9. Form with location name, latitude and longitude
- [x] R10. On submit, the new marker appears immediately without a page refresh. *Query cache update; the map also pans to it.*
- [x] R11. Clicking a marker shows the location name. *Leaflet `Popup`.*

### File upload
- [x] R12. Upload a single ZIP file that contains exactly one text file of locations
- [x] R13. On success: confirmation popup for 3 seconds, **then** the locations are added to the map. *They are added when the popup closes, then the user is taken to the map.*
- [x] R14. If the ZIP contains anything other than a single text file: error popup for 3 seconds
- [x] R15. Text file format: comma-separated, with a header line

```
Name, Latitude, Longitude
Suria KLCC,3.157324409,101.7121981
Zoo Negara,3.21054160,101.75920504
```

### Technical specifications
| Area | Requirement | Chosen |
|---|---|---|
| Frontend | React.js or Next.js with Bootstrap or Tailwind CSS | React + Vite, Tailwind CSS |
| Backend | Node.js and Express.js | Node.js + Express 5 |
| Database | PostgreSQL or MySQL | PostgreSQL |
| Authentication | JWT | JWT (httpOnly cookie) |
| Map library | react-leaflet | react-leaflet |
| State management (optional) | Any (Redux, Zustand…) | TanStack Query (server state); no global client store needed |
| Language | JavaScript or TypeScript | TypeScript (strict) |

### Deliverables
- [ ] D1. Complete source code in a GitHub repository. *Local repo ready; not pushed yet.*
- [x] D2. Comprehensive README with setup and usage instructions
- [x] D3. (Bonus) Dockerised backend. *`server/Dockerfile`, `docker-compose.yml`*

## Decisions on points the spec leaves open
- Q1. **Header line:** optional. Detected case-insensitively, whitespace-tolerant, and skipped.
- Q2. **Invalid rows:** the whole file is rejected (nothing imported), and the error popup lists up to five bad lines.
- Q3. **Extra entries in the ZIP:** any second file, including OS metadata such as `__MACOSX/` or `.DS_Store`, is an error. Folder entries are ignored, so a `.txt` inside a folder is accepted.
- Q4. **Malformed ZIP, non-ZIP upload, non-UTF-8 or binary text, empty file:** same 3-second error popup, each with its own message.
- Q5. **Order of "popup, then add":** the locations are saved on upload but added to the map only when the 3-second popup closes, and then the map page opens.
- Q6. **Edit/delete of locations:** out of scope (not required).
- Q7. **Limits:** ZIP ≤ 1 MB, uncompressed text ≤ 5 MB (zip-bomb guard), ≤ 5,000 locations per file, location name ≤ 200 characters.
- Q8. **After registration:** the user is signed in and taken to the map, with no second login step.
