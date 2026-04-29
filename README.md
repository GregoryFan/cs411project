# Carbon Emission Tracker

## This is a project for Boston University course CS411 Software Engineering
### Developed by Gregory Fan, Bryan Lam, Nicholas Reis, and Benjamin Lin

### Overview

The Carbon Emission Tracker is a web application meant to allow users to track their own carbon emissions. Currently, three are three main categories each with their own specific types: utilities, transportation and food. Users are able to submit and modify their data and then see visual progress through 
statistics and compare it to other metrics such as a yearly emission of a cow or plane.

The Carbon Emission Tracker relies on Supabase for its database and authentication system, as well as prisma for additional database API.

### How to Run

Dependencies on this project depend on `supabase`, `prisma`, `npm`, as well as `react-date-range` and `playwright` through npm.

Note that an independent environment file is needed for the system functions to work correctly. Specifically, a `DATABASE_URL` and `DIRECT_URL` for the database,  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the authentication.

To run the project, clone the repository and run `npm run dev` on the root repository. Then, the server is created and is accessible on localhost.

