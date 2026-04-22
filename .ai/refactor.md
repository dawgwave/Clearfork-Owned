1. preparation in order of importance. These will most likely be split into seprate commits. So we need to implement this plan in stages. Do not commit changes, I will review your changes and commit manually. After each stage, stop, wait for me to review and commit, then proceed onto the next stage:

    a. (done) create .env.local file for local running and debugging
    b. (done) .ai/remove-chat.md
    c. (done) run app locally.
    d. (done) .ai/nocodb-to-mysql.md
    e. (done) production on DigitalOcean droplet (Docker)

2. functionality:
    a. (done) .ai/cosmetic-changes.md 
    b. (done) registration, authentication, and authorization system with regular user and admin accounts
    c. (done) admin blog post management
    d. (done) admin page with list of quote requests.
    e. (done) user page to see quote requests with chat
    g. (done) remove from admin dashboard 
        x. "Blog Posts: Static MDX files" section
        xx. "User Management" section
    j. (done) allow image uploads in blogs management 
    f. (done) for registered users, prefill "get a quote" form with data from the user's profile
    g. (done) moved domain name from godaddy & changed DNS record to point to new server 
    h. (done) pointed protectdfw.com to clearfork
    i. (done) https
    j. (done) check if vlogs and podcasts will auto show new videos and podcasts - NO they do not
    k. (done) clean up test blogs
    l. (done) fix file upload on blog

3. updated prod deployment script to deploy only from main
2. created test server
ssh -N -L 127.0.0.1:3001:127.0.0.1:3001 root@67.205.157.124
then http://127.0.0.1:3001

4. changed /get-a-quote url to /get-auto-quote

added:

    a. allow adding multiple drivers
    b. allow adding multiple vehicles

Created database migrations and ran them.
deployed to test server.